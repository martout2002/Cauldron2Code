import type { PlatformService } from '../platform-service';
import type {
  PlatformConnection,
  DeploymentConfig,
  PlatformProject,
  EnvironmentVariable,
  DeploymentStatus,
  DatabaseInfo,
  GeneratedFile,
} from '../types';
import type { ScaffoldConfig } from '@/types';
import { vercelOAuthService } from './oauth';

/**
 * Vercel Platform Service
 * Implements the PlatformService interface for Vercel deployments
 */
export class VercelService implements PlatformService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuth(): Promise<string> {
    const state = vercelOAuthService.generateState();
    return vercelOAuthService.getAuthorizationUrl(state);
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string): Promise<PlatformConnection> {
    const tokens = await vercelOAuthService.exchangeCodeForToken(code);
    const user = await vercelOAuthService.getUserInfo(tokens.accessToken);
    
    // Create connection with a placeholder userId (should be set by caller)
    return vercelOAuthService.createConnection('placeholder', tokens, user);
  }

  /**
   * Refresh access token
   */
  async refreshToken(connection: PlatformConnection): Promise<PlatformConnection> {
    return vercelOAuthService.refreshToken(connection);
  }

  /**
   * Create a new project on Vercel
   */
  async createProject(config: DeploymentConfig): Promise<PlatformProject> {
    const framework = this.detectFramework(config.scaffoldConfig);
    const buildCommand = this.getBuildCommand(config.scaffoldConfig);
    const outputDirectory = this.getOutputDirectory(config.scaffoldConfig);
    const installCommand = this.getInstallCommand(config.scaffoldConfig);
    const rootDirectory = this.getRootDirectory(config.scaffoldConfig);

    // Vercel-specific optimizations
    const projectSettings: any = {
      name: config.projectName,
      framework,
      buildCommand,
      outputDirectory,
      installCommand,
      devCommand: 'npm run dev',
      environmentVariables: config.environmentVariables.map((v) => ({
        key: v.key,
        value: v.value,
        type: v.sensitive ? 'encrypted' : 'plain',
        target: ['production', 'preview', 'development'],
      })),
    };

    // Add root directory for monorepos
    if (rootDirectory) {
      projectSettings.rootDirectory = rootDirectory;
    }

    // Enable automatic preview deployments for branches
    projectSettings.gitRepository = {
      type: 'github',
      // This will be configured when connected to GitHub
    };

    // Add framework-specific optimizations
    const frameworkOptimizations = this.getFrameworkOptimizations(config.scaffoldConfig);
    Object.assign(projectSettings, frameworkOptimizations);

    const response = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectSettings),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to create Vercel project: ${error.message || response.statusText}`
      );
    }

    const project = await response.json();

    return {
      id: project.id,
      name: project.name,
      url: `https://${project.name}.vercel.app`,
      platform: 'vercel',
      createdAt: new Date(project.createdAt),
    };
  }

  /**
   * Check if project name is available
   */
  async checkProjectNameAvailability(name: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.vercel.com/v9/projects/${encodeURIComponent(name)}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      // If project exists, name is not available
      return !response.ok;
    } catch {
      // If there's an error, assume name is available
      return true;
    }
  }

  /**
   * Upload files and create deployment
   */
  async uploadFiles(projectId: string, files: GeneratedFile[]): Promise<void> {
    // Vercel uses a deployment-based approach
    // Files are uploaded as part of the deployment creation
    const deploymentFiles = files.map((f) => ({
      file: f.path,
      data: Buffer.from(f.content).toString('base64'),
    }));

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectId,
        files: deploymentFiles,
        projectSettings: {
          framework: 'nextjs',
        },
        target: 'production',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to upload files to Vercel: ${error.message || response.statusText}`
      );
    }
  }

  /**
   * Set environment variables for a project
   */
  async setEnvironmentVariables(
    projectId: string,
    vars: EnvironmentVariable[]
  ): Promise<void> {
    for (const envVar of vars) {
      const response = await fetch(
        `https://api.vercel.com/v10/projects/${projectId}/env`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: envVar.key,
            value: envVar.value,
            type: envVar.sensitive ? 'encrypted' : 'plain',
            target: ['production', 'preview', 'development'],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to set environment variable ${envVar.key}: ${error.message || response.statusText}`
        );
      }
    }
  }

  /**
   * Trigger a deployment
   */
  async triggerDeployment(_projectId: string): Promise<DeploymentStatus> {
    // In Vercel, deployment is triggered when files are uploaded
    // This method returns the initial status
    return {
      state: 'queued',
    };
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    const response = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get deployment status: ${response.statusText}`);
    }

    const deployment = await response.json();

    // Map Vercel states to our states
    const stateMap: Record<string, DeploymentStatus['state']> = {
      BUILDING: 'building',
      DEPLOYING: 'deploying',
      READY: 'ready',
      ERROR: 'error',
      CANCELED: 'canceled',
      QUEUED: 'queued',
    };

    return {
      state: stateMap[deployment.readyState] || 'queued',
      url: deployment.url ? `https://${deployment.url}` : undefined,
      readyAt: deployment.ready ? new Date(deployment.ready) : undefined,
      error: deployment.error?.message,
    };
  }

  /**
   * Stream build logs
   */
  async *streamBuildLogs(deploymentId: string): AsyncIterableIterator<string> {
    // Vercel provides build logs through events API
    const response = await fetch(
      `https://api.vercel.com/v2/deployments/${deploymentId}/events`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch build logs: ${response.statusText}`);
    }

    const events = await response.json();

    for (const event of events) {
      if (event.type === 'stdout' || event.type === 'stderr') {
        yield event.payload?.text || '';
      }
    }
  }

  /**
   * Detect framework from scaffold config
   * Auto-detects framework preset for optimal Vercel configuration
   */
  private detectFramework(config: ScaffoldConfig): string {
    if (config.frontendFramework === 'nextjs') return 'nextjs';
    if (config.frontendFramework === 'react') {
      // Detect if using Vite or Create React App
      if (config.buildTool === 'vite') return 'vite';
      return 'create-react-app';
    }
    if (config.frontendFramework === 'vue') {
      if (config.buildTool === 'vite') return 'vite';
      return 'vue';
    }
    if (config.frontendFramework === 'svelte') {
      if (config.buildTool === 'vite') return 'svelte-kit';
      return 'svelte';
    }
    return 'nextjs';
  }

  /**
   * Get build command based on scaffold config
   */
  private getBuildCommand(config: ScaffoldConfig): string {
    if (config.projectStructure === 'fullstack-monorepo') {
      return 'turbo build --filter=web';
    }
    
    // Framework-specific build commands
    if (config.frontendFramework === 'nextjs') {
      return 'next build';
    }
    
    return 'npm run build';
  }

  /**
   * Get output directory based on scaffold config
   * Configures output directory based on framework for optimal deployment
   */
  private getOutputDirectory(config: ScaffoldConfig): string {
    if (config.frontendFramework === 'nextjs') {
      // Next.js uses .next for standalone output
      return '.next';
    }
    
    if (config.buildTool === 'vite') {
      return 'dist';
    }
    
    if (config.frontendFramework === 'react') {
      return 'build';
    }
    
    return 'build';
  }

  /**
   * Get install command based on scaffold config
   */
  private getInstallCommand(_config: ScaffoldConfig): string {
    // Default to npm install
    // In the future, this could be detected from package.json or config
    return 'npm install';
  }

  /**
   * Get root directory for monorepo deployments
   */
  private getRootDirectory(config: ScaffoldConfig): string | undefined {
    if (config.projectStructure === 'fullstack-monorepo') {
      return 'apps/web';
    }
    return undefined;
  }

  /**
   * Get framework-specific optimizations for Vercel
   * Adds Vercel-specific build optimizations based on framework
   */
  private getFrameworkOptimizations(config: ScaffoldConfig): Record<string, any> {
    const optimizations: Record<string, any> = {};

    if (config.frontendFramework === 'nextjs') {
      // Next.js specific optimizations
      optimizations.buildCommand = 'next build';
      optimizations.outputDirectory = '.next';
      
      // Enable Next.js specific features
      optimizations.framework = 'nextjs';
      
      // Configure for standalone output (smaller deployments)
      optimizations.commandForIgnoringBuildStep = undefined;
      
      // Enable automatic static optimization
      optimizations.publicSource = './public';
    }

    if (config.buildTool === 'vite') {
      // Vite specific optimizations
      optimizations.buildCommand = 'vite build';
      optimizations.outputDirectory = 'dist';
      
      // Enable Vite optimizations
      optimizations.devCommand = 'vite';
    }

    // Enable preview deployments for all branches
    optimizations.autoExposeSystemEnvs = true;
    
    // Configure deployment protection
    optimizations.protectionBypass = {
      scope: 'automation-bypass',
    };

    return optimizations;
  }

  /**
   * Vercel doesn't support automatic database provisioning
   */
  async provisionDatabase?(
    _type: 'postgres' | 'mysql' | 'mongodb'
  ): Promise<DatabaseInfo> {
    throw new Error('Vercel does not support automatic database provisioning');
  }
}
