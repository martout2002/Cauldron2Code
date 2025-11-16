/**
 * Monorepo Deployment Strategy
 * Handles deployment of monorepo projects with multiple services
 */

import type {
  DeploymentConfig,
  Deployment,
  DeploymentService,
  DeployedService,
  GeneratedFile,
  EnvironmentVariable,
  PlatformType,
} from '@/lib/platforms/types';
import type { ScaffoldConfig } from '@/types';
import type { PlatformService } from '@/lib/platforms/platform-service';
import { VercelService } from '@/lib/platforms/vercel/vercel-service';
import { RailwayService } from '@/lib/platforms/railway/railway-service';
import { RenderService } from '@/lib/platforms/render/render-service';
import { ScaffoldGenerator } from '@/lib/generator/scaffold-generator';
import { addFrameworkProperty } from '@/types';
import { EnvironmentVariableDetector } from './environment-detector';
import { getProgressTracker } from './progress-tracker';
import { DeploymentErrorHandler } from './error-handler';
import { FileFilter } from './file-filter';

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
 * MonorepoDeploymentStrategy handles deployment of monorepo projects
 * with multiple services that may have dependencies on each other
 */
export class MonorepoDeploymentStrategy {
  private platformServices: Map<PlatformType, PlatformService>;
  private progressTracker = getProgressTracker();
  private deploymentTimeout = 10 * 60 * 1000; // 10 minutes for monorepo
  private fileFilter: FileFilter;

  constructor() {
    this.platformServices = new Map();
    // Initialize platform services (these will be configured with tokens at runtime)
    this.platformServices.set('vercel', new VercelService(''));
    this.platformServices.set('railway', new RailwayService(''));
    this.platformServices.set('render', new RenderService(''));
    this.fileFilter = new FileFilter();
  }

  /**
   * Deploy a monorepo scaffold to the specified platform
   * @param config - Deployment configuration
   * @param userId - User ID for tracking
   * @returns Deployment result with multiple services
   */
  async deploy(config: DeploymentConfig, userId: string): Promise<Deployment> {
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
      // Initialize progress tracking
      this.progressTracker.update(
        deployment.id,
        'Initializing monorepo deployment...',
        'pending'
      );

      // Step 1: Detect services from scaffold config
      const services = this.detectServices(config.scaffoldConfig);
      this.progressTracker.update(
        deployment.id,
        `Detected ${services.length} services to deploy`
      );

      // Step 2: Sort services by dependency order
      const deploymentOrder = this.topologicalSort(services);
      this.progressTracker.update(
        deployment.id,
        `Deployment order: ${deploymentOrder.map((s) => s.name).join(' → ')}`
      );

      // Step 3: Generate all scaffold files once
      this.progressTracker.update(deployment.id, 'Generating scaffold files...');
      const allFiles = await this.generateScaffold(config);

      // Step 4: Initialize service progress tracking
      for (const service of deploymentOrder) {
        this.progressTracker.updateService(
          deployment.id,
          service.name,
          'pending',
          'Waiting to deploy...'
        );
      }

      // Step 5: Deploy services in dependency order
      for (let i = 0; i < deploymentOrder.length; i++) {
        const service = deploymentOrder[i];
        if (!service) {
          throw new Error(`Service at index ${i} is undefined`);
        }

        this.progressTracker.update(
          deployment.id,
          `Deploying service ${i + 1}/${deploymentOrder.length}: ${service.name}...`
        );

        this.progressTracker.updateService(
          deployment.id,
          service.name,
          'building',
          'Starting deployment...'
        );

        const deployedService = await this.deployService(
          service,
          config,
          deployment.services,
          allFiles,
          deployment
        );

        deployment.services.push(deployedService);

        this.progressTracker.updateService(
          deployment.id,
          service.name,
          'success',
          'Deployed successfully',
          deployedService.url
        );
      }

      // All services deployed successfully
      deployment.status = 'success';
      deployment.completedAt = new Date();
      deployment.duration =
        deployment.completedAt.getTime() - deployment.createdAt.getTime();

      // Complete with all service URLs
      const serviceUrls = new Map<string, string>();
      deployment.services.forEach((service) => {
        serviceUrls.set(service.name, service.url);
      });

      this.progressTracker.completeMultiService(deployment.id, serviceUrls);

      return deployment;
    } catch (error: any) {
      deployment.status = 'failed';
      deployment.error = DeploymentErrorHandler.createError(error, 'deploy', {
        recoverable: true,
      });
      deployment.completedAt = new Date();
      deployment.duration =
        deployment.completedAt.getTime() - deployment.createdAt.getTime();

      this.progressTracker.fail(deployment.id, deployment.error);

      return deployment;
    }
  }

  /**
   * Detect services from scaffold configuration
   * @param config - Scaffold configuration
   * @returns Array of deployment services
   */
  detectServices(config: ScaffoldConfig): DeploymentService[] {
    const services: DeploymentService[] = [];

    // Only detect services for monorepo structure
    if (config.projectStructure !== 'fullstack-monorepo') {
      return services;
    }

    const detector = new EnvironmentVariableDetector();
    const allEnvVars = detector.detect(config);

    // Backend service (API)
    const backendEnvVars = this.getBackendEnvVars(allEnvVars);
    services.push({
      name: 'api',
      type: 'backend',
      buildCommand: 'npm run build --filter=api',
      startCommand: 'npm start --filter=api',
      environmentVariables: backendEnvVars,
      dependencies: [], // Backend has no dependencies
    });

    // Frontend service (Web)
    const frontendEnvVars = this.getFrontendEnvVars(allEnvVars);
    services.push({
      name: 'web',
      type: 'frontend',
      buildCommand: 'npm run build --filter=web',
      startCommand: 'npm start --filter=web',
      outputDirectory: config.frontendFramework === 'nextjs' ? '.next' : 'dist',
      environmentVariables: frontendEnvVars,
      dependencies: ['api'], // Frontend depends on backend
    });

    return services;
  }

  /**
   * Perform topological sort on services based on dependencies
   * @param services - Array of deployment services
   * @returns Sorted array with dependencies first
   */
  private topologicalSort(services: DeploymentService[]): DeploymentService[] {
    const sorted: DeploymentService[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (service: DeploymentService) => {
      if (visited.has(service.name)) return;

      if (visiting.has(service.name)) {
        throw new Error(
          `Circular dependency detected involving service: ${service.name}`
        );
      }

      visiting.add(service.name);

      // Visit dependencies first
      for (const depName of service.dependencies) {
        const depService = services.find((s) => s.name === depName);
        if (!depService) {
          throw new Error(
            `Dependency '${depName}' not found for service '${service.name}'`
          );
        }
        visit(depService);
      }

      visiting.delete(service.name);
      visited.add(service.name);
      sorted.push(service);
    };

    // Visit all services
    for (const service of services) {
      visit(service);
    }

    return sorted;
  }

  /**
   * Deploy a single service
   * @param service - Service to deploy
   * @param config - Deployment configuration
   * @param deployedServices - Already deployed services
   * @param allFiles - All generated files
   * @param deployment - Parent deployment object
   * @returns Deployed service information
   */
  private async deployService(
    service: DeploymentService,
    config: DeploymentConfig,
    deployedServices: DeployedService[],
    allFiles: GeneratedFile[],
    deployment: Deployment
  ): Promise<DeployedService> {
    const platformService = this.getPlatformService(config.platform);
    if (!platformService) {
      throw new Error(`Platform ${config.platform} is not supported`);
    }

    try {
      // Step 1: Create project for this service
      this.progressTracker.update(
        deployment.id,
        `Creating ${service.name} project on ${config.platform}...`
      );

      const serviceConfig: DeploymentConfig = {
        ...config,
        projectName: `${config.projectName}-${service.name}`,
        services: [service],
      };

      const project = await platformService.createProject(serviceConfig);

      // Step 2: Configure environment variables with dependency URLs
      const envVars = this.configureServiceEnvironment(service, deployedServices);

      // Step 3: Filter and upload files for this service
      this.progressTracker.update(
        deployment.id,
        `Uploading ${service.name} files...`
      );

      const serviceFiles = this.filterServiceFiles(service, allFiles);
      await platformService.uploadFiles(project.id, serviceFiles);

      // Step 4: Set environment variables
      this.progressTracker.update(
        deployment.id,
        `Configuring ${service.name} environment...`
      );

      await platformService.setEnvironmentVariables(project.id, envVars);

      // Step 5: Trigger deployment
      this.progressTracker.update(
        deployment.id,
        `Building ${service.name}...`,
        'building'
      );

      const deploymentStatus = await platformService.triggerDeployment(project.id);

      // Step 6: Monitor deployment
      await this.monitorServiceDeployment(
        platformService,
        deploymentStatus,
        service,
        project,
        deployment
      );

      return {
        name: service.name,
        url: project.url,
        status: 'success',
        platformProjectId: project.id,
        buildLogs: [],
      };
    } catch (error: any) {
      // Service deployment failed
      this.progressTracker.updateService(
        deployment.id,
        service.name,
        'failed',
        `Deployment failed: ${error.message}`
      );

      this.progressTracker.update(
        deployment.id,
        `Failed to deploy ${service.name}: ${error.message}`
      );

      throw error;
    }
  }

  /**
   * Configure environment variables for a service, including dependency URLs
   * @param service - Service being deployed
   * @param deployedServices - Already deployed services
   * @returns Array of environment variables
   */
  private configureServiceEnvironment(
    service: DeploymentService,
    deployedServices: DeployedService[]
  ): EnvironmentVariable[] {
    const envVars = [...service.environmentVariables];

    // Add dependency URLs as environment variables
    for (const depName of service.dependencies) {
      const depService = deployedServices.find((s) => s.name === depName);
      if (depService && depService.url) {
        const envKey = `${depName.toUpperCase()}_URL`;
        envVars.push({
          key: envKey,
          value: depService.url,
          description: `URL of ${depName} service`,
          required: true,
          sensitive: false,
        });

        // Also add as NEXT_PUBLIC_ for frontend access if this is a frontend service
        if (service.type === 'frontend') {
          envVars.push({
            key: `NEXT_PUBLIC_${envKey}`,
            value: depService.url,
            description: `Public URL of ${depName} service`,
            required: true,
            sensitive: false,
          });
        }
      }
    }

    return envVars;
  }

  /**
   * Filter files for a specific service
   * @param service - Service to filter files for
   * @param allFiles - All generated files
   * @returns Filtered files for the service
   */
  private filterServiceFiles(
    service: DeploymentService,
    allFiles: GeneratedFile[]
  ): GeneratedFile[] {
    const filtered = this.fileFilter.filterForService(service, allFiles);

    // Validate filtered files
    const validation = this.fileFilter.validateServiceFiles(service, filtered);
    if (!validation.isValid) {
      throw new Error(
        `Invalid file set for service ${service.name}: ${validation.errors.join(', ')}`
      );
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn(
        `Warnings for service ${service.name}:`,
        validation.warnings.join(', ')
      );
    }

    // Log statistics
    const stats = this.fileFilter.getFilterStats(service, allFiles);
    console.log(
      `Service ${service.name}: ${stats.totalFiles} files (${stats.serviceFiles} service, ${stats.sharedFiles} shared, ${stats.configFiles} config)`
    );

    return filtered;
  }

  /**
   * Monitor a service deployment
   * @param service - Platform service
   * @param deploymentStatus - Initial deployment status
   * @param serviceConfig - Service configuration
   * @param project - Platform project
   * @param deployment - Parent deployment
   */
  private async monitorServiceDeployment(
    service: PlatformService,
    deploymentStatus: any,
    serviceConfig: DeploymentService,
    project: any,
    deployment: Deployment
  ): Promise<void> {
    const pollInterval = 5000; // 5 seconds
    const maxAttempts = Math.floor(this.deploymentTimeout / pollInterval);
    let attempts = 0;

    const deploymentId = deploymentStatus.id || deployment.id;

    while (attempts < maxAttempts) {
      try {
        const status = await service.getDeploymentStatus(deploymentId);

        // Stream build logs if available
        try {
          const logIterator = service.streamBuildLogs(deploymentId);
          for await (const log of logIterator) {
            deployment.buildLogs.push(`[${serviceConfig.name}] ${log}`);
            this.progressTracker.updateLogs(deployment.id, `[${serviceConfig.name}] ${log}`);
            this.progressTracker.updateServiceLogs(deployment.id, serviceConfig.name, log);
          }
        } catch (logError) {
          // Log streaming is optional
          console.warn(`Failed to stream logs for ${serviceConfig.name}:`, logError);
        }

        // Check deployment state
        if (status.state === 'ready') {
          this.progressTracker.update(
            deployment.id,
            `✓ ${serviceConfig.name} deployed successfully`
          );
          this.progressTracker.updateService(
            deployment.id,
            serviceConfig.name,
            'success',
            'Deployed successfully',
            project.url
          );
          return;
        }

        if (status.state === 'error' || status.state === 'canceled') {
          this.progressTracker.updateService(
            deployment.id,
            serviceConfig.name,
            'failed',
            status.error || 'Deployment failed'
          );
          throw new Error(
            `${serviceConfig.name} deployment failed: ${status.error || 'Unknown error'}`
          );
        }

        // Update progress
        if (status.state === 'building') {
          this.progressTracker.update(
            deployment.id,
            `Building ${serviceConfig.name}...`,
            'building'
          );
          this.progressTracker.updateService(
            deployment.id,
            serviceConfig.name,
            'building',
            'Building...'
          );
        } else if (status.state === 'deploying') {
          this.progressTracker.update(
            deployment.id,
            `Deploying ${serviceConfig.name}...`,
            'deploying'
          );
          this.progressTracker.updateService(
            deployment.id,
            serviceConfig.name,
            'deploying',
            'Deploying...'
          );
        }

        await sleep(pollInterval);
        attempts++;
      } catch (error: any) {
        console.warn(`Failed to get deployment status for ${serviceConfig.name}:`, error);
        await sleep(pollInterval);
        attempts++;
      }
    }

    // Timeout
    throw new Error(
      `${serviceConfig.name} deployment timed out after ${this.deploymentTimeout / 1000 / 60} minutes`
    );
  }

  /**
   * Generate scaffold files
   * @param config - Deployment configuration
   * @returns Array of generated files
   */
  private async generateScaffold(config: DeploymentConfig): Promise<GeneratedFile[]> {
    const configWithFramework = addFrameworkProperty(config.scaffoldConfig);
    const generator = new ScaffoldGenerator(configWithFramework);
    const result = await generator.generate(false);

    return result.files.map((file) => ({
      path: file.path,
      content: file.content,
    }));
  }

  /**
   * Get backend-specific environment variables
   * @param allEnvVars - All detected environment variables
   * @returns Backend environment variables
   */
  private getBackendEnvVars(allEnvVars: EnvironmentVariable[]): EnvironmentVariable[] {
    return allEnvVars.filter(
      (v) =>
        !v.key.startsWith('NEXT_PUBLIC_') &&
        v.key !== 'NEXTAUTH_URL' // NEXTAUTH_URL goes to frontend
    );
  }

  /**
   * Get frontend-specific environment variables
   * @param allEnvVars - All detected environment variables
   * @returns Frontend environment variables
   */
  private getFrontendEnvVars(allEnvVars: EnvironmentVariable[]): EnvironmentVariable[] {
    return allEnvVars.filter(
      (v) => v.key.startsWith('NEXT_PUBLIC_') || v.key === 'NEXTAUTH_URL'
    );
  }

  /**
   * Get platform service instance
   * @param platform - Platform type
   * @returns Platform service or undefined
   */
  private getPlatformService(platform: PlatformType): PlatformService | undefined {
    return this.platformServices.get(platform);
  }

  /**
   * Set custom deployment timeout
   * @param timeoutMs - Timeout in milliseconds
   */
  setDeploymentTimeout(timeoutMs: number): void {
    this.deploymentTimeout = timeoutMs;
  }
}

// Singleton instance
let strategyInstance: MonorepoDeploymentStrategy | null = null;

/**
 * Get the singleton MonorepoDeploymentStrategy instance
 */
export function getMonorepoDeploymentStrategy(): MonorepoDeploymentStrategy {
  if (!strategyInstance) {
    strategyInstance = new MonorepoDeploymentStrategy();
  }
  return strategyInstance;
}
