/**
 * Deployment Orchestrator
 * Manages the complete deployment workflow from project creation to monitoring
 */

import type {
  DeploymentConfig,
  Deployment,
  PlatformType,
  GeneratedFile,
  DeploymentStatus,
} from '@/lib/platforms/types';
import type { PlatformService } from '@/lib/platforms/platform-service';
import { VercelService } from '@/lib/platforms/vercel/vercel-service';
import { RailwayService } from '@/lib/platforms/railway/railway-service';
import { RenderService } from '@/lib/platforms/render/render-service';
import { ScaffoldGenerator } from '@/lib/generator/scaffold-generator';
import { addFrameworkProperty } from '@/types';
import { getProgressTracker } from './progress-tracker';
import { DeploymentErrorHandler } from './error-handler';
import { getDeploymentStore } from './deployment-store';
import { getMonorepoDeploymentStrategy } from './monorepo-strategy';
import { getDeploymentCache, CacheKeys, CacheTTL } from './deployment-cache';

/**
 * Sleep utility for polling delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a unique deployment ID
 */
function generateId(): string {
  return `deploy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * DeploymentOrchestrator manages the complete deployment workflow
 */
export class DeploymentOrchestrator {
  private platformServices: Map<PlatformType, PlatformService>;
  private progressTracker = getProgressTracker();
  private deploymentStore = getDeploymentStore();
  private cache = getDeploymentCache();
  private deploymentTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.platformServices = new Map();
    // Initialize platform services (these will be configured with tokens at runtime)
    this.platformServices.set('vercel', new VercelService(''));
    this.platformServices.set('railway', new RailwayService(''));
    this.platformServices.set('render', new RenderService(''));
  }

  /**
   * Deploy a scaffold to the specified platform
   * @param config - Deployment configuration
   * @param userId - User ID for tracking
   * @returns Deployment result
   */
  async deploy(config: DeploymentConfig, userId: string): Promise<Deployment> {
    // Check if this is a monorepo deployment
    if (this.isMonorepoDeployment(config)) {
      const monorepoStrategy = getMonorepoDeploymentStrategy();
      return monorepoStrategy.deploy(config, userId);
    }

    const deployment: Deployment = {
      id: generateId(),
      userId,
      projectName: config.projectName,
      platform: config.platform,
      status: 'pending',
      services: [],
      config,
      buildLogs: [],
      createdAt: new Date(),
    };

    try {
      // Save initial deployment state
      this.deploymentStore.save(deployment);

      // Initialize progress tracking
      this.progressTracker.update(deployment.id, 'Initializing deployment...');

      // Step 1: Get platform service
      const platformService = this.platformServices.get(config.platform);
      if (!platformService) {
        throw new Error(`Platform ${config.platform} is not supported`);
      }

      // Step 2 & 3: Create project and generate scaffold in parallel
      this.progressTracker.update(deployment.id, 'Creating project and generating scaffold...', 'pending');
      const [project, files] = await Promise.all([
        this.createProject(platformService, config, deployment),
        this.generateScaffold(config, deployment),
      ]);

      // Step 4 & 5: Upload files and configure environment in parallel
      this.progressTracker.update(deployment.id, 'Uploading files and configuring environment...');
      await Promise.all([
        this.uploadFiles(platformService, project.id, files, deployment),
        this.configureEnvironment(platformService, project.id, config, deployment),
      ]);

      // Step 6: Trigger deployment
      this.progressTracker.update(deployment.id, 'Starting build...', 'building');
      deployment.status = 'building';
      const deploymentStatus = await this.triggerDeployment(
        platformService,
        project.id,
        deployment
      );

      // Step 7: Monitor deployment with timeout
      await this.monitorDeployment(
        platformService,
        deploymentStatus,
        deployment,
        project.url
      );

      // Update deployment in store
      this.deploymentStore.update(deployment);

      return deployment;
    } catch (error: any) {
      deployment.status = 'failed';
      deployment.error = DeploymentErrorHandler.createError(
        error,
        this.determineErrorStep(deployment),
        { recoverable: true }
      );
      deployment.completedAt = new Date();
      deployment.duration =
        deployment.completedAt.getTime() - deployment.createdAt.getTime();

      this.progressTracker.fail(deployment.id, deployment.error);

      // Update deployment in store
      this.deploymentStore.update(deployment);

      return deployment;
    }
  }

  /**
   * Create project on the platform
   */
  private async createProject(
    service: PlatformService,
    config: DeploymentConfig,
    deployment: Deployment
  ) {
    try {
      return await service.createProject(config);
    } catch (error: any) {
      const deploymentError = DeploymentErrorHandler.createError(error, 'create');
      deployment.error = deploymentError;
      throw error;
    }
  }

  /**
   * Generate scaffold files
   */
  private async generateScaffold(
    config: DeploymentConfig,
    deployment: Deployment
  ): Promise<GeneratedFile[]> {
    try {
      const configWithFramework = addFrameworkProperty(config.scaffoldConfig);
      const generator = new ScaffoldGenerator(configWithFramework);
      const result = await generator.generate(false);

      return result.files.map((file) => ({
        path: file.path,
        content: file.content,
      }));
    } catch (error: any) {
      const deploymentError = DeploymentErrorHandler.createError(error, 'create', {
        code: 'SCAFFOLD_GENERATION_FAILED',
        message: 'Failed to generate scaffold files',
        recoverable: false,
      });
      deployment.error = deploymentError;
      throw error;
    }
  }

  /**
   * Upload files to platform with retry logic and progress tracking
   */
  private async uploadFiles(
    service: PlatformService,
    projectId: string,
    files: GeneratedFile[],
    deployment: Deployment
  ): Promise<void> {
    const maxRetries = 3;
    let attempt = 0;
    const totalFiles = files.length;

    while (attempt < maxRetries) {
      try {
        // Update progress with file count
        this.progressTracker.update(
          deployment.id,
          `Uploading ${totalFiles} files to platform...`
        );

        await service.uploadFiles(projectId, files);
        
        // Success - update progress
        this.progressTracker.update(
          deployment.id,
          `Successfully uploaded ${totalFiles} files`
        );
        
        return;
      } catch (error: any) {
        attempt++;
        
        if (attempt >= maxRetries) {
          // All retries exhausted - create detailed error with GitHub fallback suggestion
          const deploymentError = DeploymentErrorHandler.createError(error, 'upload', {
            code: 'UPLOAD_FAILED',
            message: `Failed to upload files after ${maxRetries} attempts. This is usually due to network issues or platform limitations.`,
            recoverable: true,
            suggestions: [
              'Check your internet connection',
              'Try the deployment again',
              'Create a GitHub repository as an alternative',
              'If the issue persists, try a different platform',
            ],
          });
          deployment.error = deploymentError;
          throw error;
        }

        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000;
        this.progressTracker.update(
          deployment.id,
          `Upload failed, retrying in ${delay / 1000}s... (attempt ${attempt}/${maxRetries})`
        );
        
        // Log the retry attempt
        deployment.buildLogs.push(
          `[RETRY] Upload attempt ${attempt} failed: ${error.message}. Retrying in ${delay / 1000}s...`
        );
        
        await sleep(delay);
      }
    }
  }

  /**
   * Configure environment variables
   */
  private async configureEnvironment(
    service: PlatformService,
    projectId: string,
    config: DeploymentConfig,
    deployment: Deployment
  ): Promise<void> {
    try {
      await service.setEnvironmentVariables(projectId, config.environmentVariables);
    } catch (error: any) {
      const deploymentError = DeploymentErrorHandler.createError(error, 'configure');
      deployment.error = deploymentError;
      throw error;
    }
  }

  /**
   * Trigger deployment build
   */
  private async triggerDeployment(
    service: PlatformService,
    projectId: string,
    deployment: Deployment
  ): Promise<DeploymentStatus> {
    try {
      return await service.triggerDeployment(projectId);
    } catch (error: any) {
      const deploymentError = DeploymentErrorHandler.createError(error, 'deploy');
      deployment.error = deploymentError;
      throw error;
    }
  }

  /**
   * Monitor deployment progress with polling and timeout
   */
  private async monitorDeployment(
    service: PlatformService,
    deploymentStatus: DeploymentStatus,
    deployment: Deployment,
    projectUrl: string
  ): Promise<void> {
    const pollInterval = 5000; // 5 seconds
    const maxAttempts = Math.floor(this.deploymentTimeout / pollInterval);
    let attempts = 0;

    // Get deployment ID from status or use a fallback
    const deploymentId = (deploymentStatus as any).id || deployment.id;

    while (attempts < maxAttempts) {
      try {
        // Check cache first to avoid redundant API calls
        const cacheKey = CacheKeys.deploymentStatus(deploymentId);
        let status = this.cache.get<DeploymentStatus>(cacheKey);
        
        // If not in cache or cache expired, fetch from API
        if (!status) {
          status = await service.getDeploymentStatus(deploymentId);
          // Cache the status for 5 seconds
          this.cache.set(cacheKey, status, CacheTTL.DEPLOYMENT_STATUS);
        }

        // Stream build logs if available
        try {
          const logIterator = service.streamBuildLogs(deploymentId);
          for await (const log of logIterator) {
            deployment.buildLogs.push(log);
            this.progressTracker.updateLogs(deployment.id, log);
          }
        } catch (logError) {
          // Log streaming is optional, don't fail deployment if it errors
          console.warn('Failed to stream logs:', logError);
        }

        // Check deployment state
        if (status.state === 'ready') {
          deployment.status = 'success';
          deployment.deploymentUrl = status.url || projectUrl;
          deployment.completedAt = new Date();
          deployment.duration =
            deployment.completedAt.getTime() - deployment.createdAt.getTime();

          this.progressTracker.complete(deployment.id, deployment.deploymentUrl);
          return;
        }

        if (status.state === 'error' || status.state === 'canceled') {
          deployment.status = 'failed';
          deployment.error = {
            code: 'BUILD_FAILED',
            message: status.error || 'Build failed',
            step: 'build',
            platformError: status,
            recoverable: true,
            suggestions: [
              'Check build logs for specific errors',
              'Verify environment variables are correct',
              'Ensure dependencies are compatible',
              'Try deploying again',
            ],
          };
          deployment.completedAt = new Date();
          deployment.duration =
            deployment.completedAt.getTime() - deployment.createdAt.getTime();

          this.progressTracker.fail(deployment.id, deployment.error);
          return;
        }

        // Update progress based on state
        if (status.state === 'building') {
          deployment.status = 'building';
          this.progressTracker.update(deployment.id, 'Building application...', 'building');
        } else if (status.state === 'deploying') {
          deployment.status = 'deploying';
          this.progressTracker.update(deployment.id, 'Deploying application...', 'deploying');
        } else if (status.state === 'queued') {
          this.progressTracker.update(deployment.id, 'Queued for deployment...');
        }

        // Wait before next poll
        await sleep(pollInterval);
        attempts++;
      } catch (error: any) {
        // If we can't get status, wait and retry
        console.warn('Failed to get deployment status:', error);
        await sleep(pollInterval);
        attempts++;
      }
    }

    // Timeout reached
    deployment.status = 'failed';
    deployment.error = {
      code: 'TIMEOUT',
      message: 'Deployment timed out after 5 minutes',
      step: 'deploy',
      recoverable: true,
      suggestions: [
        'Check deployment status on platform dashboard',
        'The deployment may still complete successfully',
        'If it fails, you can retry the deployment',
      ],
    };
    deployment.completedAt = new Date();
    deployment.duration = deployment.completedAt.getTime() - deployment.createdAt.getTime();

    this.progressTracker.fail(deployment.id, deployment.error);
  }

  /**
   * Determine which step the error occurred in based on deployment state
   */
  private determineErrorStep(deployment: Deployment): 'auth' | 'create' | 'upload' | 'configure' | 'build' | 'deploy' {
    if (!deployment.services || deployment.services.length === 0) {
      return 'create';
    }

    if (deployment.buildLogs.length === 0) {
      return 'upload';
    }

    if (deployment.status === 'building') {
      return 'build';
    }

    if (deployment.status === 'deploying') {
      return 'deploy';
    }

    return 'deploy';
  }

  /**
   * Check if deployment is for a monorepo project
   * @param config - Deployment configuration
   * @returns True if monorepo deployment
   */
  private isMonorepoDeployment(config: DeploymentConfig): boolean {
    return config.scaffoldConfig.projectStructure === 'fullstack-monorepo';
  }

  /**
   * Set custom deployment timeout
   * @param timeoutMs - Timeout in milliseconds
   */
  setDeploymentTimeout(timeoutMs: number): void {
    this.deploymentTimeout = timeoutMs;
  }

  /**
   * Get platform service for testing or direct access
   * @param platform - Platform type
   */
  getPlatformService(platform: PlatformType): PlatformService | undefined {
    return this.platformServices.get(platform);
  }
}

// Singleton instance
let orchestratorInstance: DeploymentOrchestrator | null = null;

/**
 * Get the singleton DeploymentOrchestrator instance
 */
export function getDeploymentOrchestrator(): DeploymentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new DeploymentOrchestrator();
  }
  return orchestratorInstance;
}
