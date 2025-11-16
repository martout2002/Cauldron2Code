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
import { getRenderOAuthService } from './oauth';

/**
 * Render Platform Service
 * Implements the PlatformService interface for Render deployments
 */
export class RenderService implements PlatformService {
  private accessToken: string;
  private baseUrl = 'https://api.render.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuth(): Promise<string> {
    const service = getRenderOAuthService();
    const state = service.generateState();
    return service.getAuthorizationUrl(state);
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string): Promise<PlatformConnection> {
    const service = getRenderOAuthService();
    const tokens = await service.exchangeCodeForToken(code);
    const user = await service.getUserInfo(tokens.accessToken);

    // Create connection with a placeholder userId (should be set by caller)
    return service.createConnection('placeholder', tokens, user);
  }

  /**
   * Refresh access token
   */
  async refreshToken(connection: PlatformConnection): Promise<PlatformConnection> {
    return getRenderOAuthService().refreshToken(connection);
  }

  /**
   * Get owner ID (required for creating services)
   */
  private async getOwnerId(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/owners`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch owner info: ${response.statusText}`);
    }

    const owners = await response.json();
    
    if (!owners || owners.length === 0) {
      throw new Error('No owner found for this account');
    }

    return owners[0].owner.id;
  }

  /**
   * Create a new web service on Render
   * Configures build and start commands, health check paths, and publish paths
   */
  async createProject(config: DeploymentConfig): Promise<PlatformProject> {
    const ownerId = await this.getOwnerId();
    const buildCommand = this.getBuildCommand(config.scaffoldConfig);
    const startCommand = this.getStartCommand(config.scaffoldConfig);
    const publishPath = this.getPublishPath(config.scaffoldConfig);
    const healthCheckPath = this.getHealthCheckPath(config.scaffoldConfig);
    const runtime = this.getRuntime(config.scaffoldConfig);

    // Render-specific service configuration
    const serviceConfig: any = {
      type: 'web_service',
      name: config.projectName,
      ownerId: ownerId,
      autoDeploy: 'yes',
      buildCommand,
      startCommand,
      envVars: config.environmentVariables.map((v) => ({
        key: v.key,
        value: v.value,
      })),
      serviceDetails: {
        publishPath,
        healthCheckPath,
        env: runtime,
        // Configure pull request previews
        pullRequestPreviewsEnabled: 'yes',
        // Set region
        region: 'oregon',
        // Configure plan
        plan: 'starter',
      },
    };

    // Add root directory for monorepos
    const rootDirectory = this.getRootDirectory(config.scaffoldConfig);
    if (rootDirectory) {
      serviceConfig.rootDir = rootDirectory;
    }

    const response = await fetch(`${this.baseUrl}/services`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(serviceConfig),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to create Render service: ${error.message || response.statusText}`
      );
    }

    const service = await response.json();

    return {
      id: service.service.id,
      name: service.service.name,
      url: service.service.serviceDetails?.url || `https://${config.projectName}.onrender.com`,
      platform: 'render',
      createdAt: new Date(service.service.createdAt),
    };
  }

  /**
   * Check if project name is available
   */
  async checkProjectNameAvailability(name: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/services?name=${encodeURIComponent(name)}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return true; // Assume available if we can't check
      }

      const services = await response.json();
      
      // Check if any service has this exact name
      return !services.some((s: any) => s.service?.name === name);
    } catch {
      // If there's an error, assume name is available
      return true;
    }
  }

  /**
   * Upload files to Render
   * Note: Render requires git-based deployment, so this creates a manual deploy
   */
  async uploadFiles(serviceId: string, _files: GeneratedFile[]): Promise<void> {
    // Render requires git-based deployment
    // For now, we'll trigger a manual deploy
    // In production, you would need to create a temporary git repo
    // or use Render's deploy hook
    const response = await fetch(`${this.baseUrl}/services/${serviceId}/deploys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        clearCache: 'do_not_clear',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to trigger Render deployment: ${error.message || response.statusText}`
      );
    }
  }

  /**
   * Set environment variables for a service
   */
  async setEnvironmentVariables(
    serviceId: string,
    vars: EnvironmentVariable[]
  ): Promise<void> {
    for (const envVar of vars) {
      const response = await fetch(`${this.baseUrl}/services/${serviceId}/env-vars`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          key: envVar.key,
          value: envVar.value,
        }),
      });

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
  async triggerDeployment(serviceId: string): Promise<DeploymentStatus> {
    const response = await fetch(`${this.baseUrl}/services/${serviceId}/deploys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        clearCache: 'do_not_clear',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to trigger deployment: ${error.message || response.statusText}`
      );
    }

    const deploy = await response.json();

    return {
      state: 'queued',
      url: deploy.deploy?.url,
    };
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    const response = await fetch(`${this.baseUrl}/deploys/${deploymentId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get deployment status: ${response.statusText}`);
    }

    const data = await response.json();
    const deploy = data.deploy;

    // Map Render states to our states
    const stateMap: Record<string, DeploymentStatus['state']> = {
      created: 'queued',
      build_in_progress: 'building',
      update_in_progress: 'deploying',
      live: 'ready',
      deactivated: 'canceled',
      build_failed: 'error',
      update_failed: 'error',
      canceled: 'canceled',
      pre_deploy_in_progress: 'building',
    };

    return {
      state: stateMap[deploy.status] || 'queued',
      url: deploy.url,
      readyAt: deploy.status === 'live' ? new Date(deploy.finishedAt) : undefined,
      error: deploy.status.includes('failed') ? 'Deployment failed' : undefined,
    };
  }

  /**
   * Stream build logs
   */
  async *streamBuildLogs(deploymentId: string): AsyncIterableIterator<string> {
    // Render provides build logs through their API
    const response = await fetch(`${this.baseUrl}/deploys/${deploymentId}/logs`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch build logs: ${response.statusText}`);
    }

    const data = await response.json();
    const logs = data.logs || [];

    // Yield each log entry
    for (const log of logs) {
      if (log.message) {
        yield `[${log.timestamp}] ${log.message}`;
      }
    }
  }

  /**
   * Provision a PostgreSQL database on Render
   * Adds automatic database provisioning with proper configuration
   */
  async provisionDatabase(type: 'postgres' | 'mysql'): Promise<DatabaseInfo> {
    if (type !== 'postgres') {
      throw new Error('Render only supports PostgreSQL databases');
    }

    const ownerId = await this.getOwnerId();

    const response = await fetch(`${this.baseUrl}/postgres`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: `database-${Date.now()}`,
        ownerId: ownerId,
        databaseName: 'myapp',
        databaseUser: 'myapp_user',
        plan: 'starter',
        region: 'oregon',
        // Enable high availability for production
        highAvailabilityEnabled: false,
        // Set PostgreSQL version
        version: '15',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to provision database: ${error.message || response.statusText}`
      );
    }

    const data = await response.json();
    const db = data.postgres;

    // Wait for database to be ready
    await this.waitForDatabaseReady(db.id);

    return {
      connectionString: db.connectionInfo?.externalConnectionString || '',
      host: db.connectionInfo?.host || '',
      port: db.connectionInfo?.port || 5432,
      database: db.databaseName,
      username: db.databaseUser,
      password: db.connectionInfo?.password || '',
    };
  }

  /**
   * Wait for database to be ready
   */
  private async waitForDatabaseReady(databaseId: string, maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`${this.baseUrl}/postgres/${databaseId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.postgres?.status === 'available') {
          return;
        }
      }

      // Wait 2 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Database provisioning timed out');
  }

  /**
   * Get build command based on scaffold config
   * Configures build commands for optimal Render deployment
   */
  private getBuildCommand(config: ScaffoldConfig): string {
    if (config.projectStructure === 'fullstack-monorepo') {
      return 'npm install && npm run build --filter=web';
    }

    // Framework-specific build commands
    if (config.frontendFramework === 'nextjs') {
      return 'npm install && npm run build';
    }

    if (config.buildTool === 'vite') {
      return 'npm install && npm run build';
    }

    return 'npm install && npm run build';
  }

  /**
   * Get start command based on scaffold config
   * Sets up start commands for different frameworks
   */
  private getStartCommand(config: ScaffoldConfig): string {
    if (config.frontendFramework === 'nextjs') {
      return 'npm start';
    }

    if (config.backendFramework === 'express') {
      return 'node dist/server.js';
    }

    if (config.buildTool === 'vite') {
      // For static sites built with Vite, use a simple server
      return 'npx serve -s dist -l 3000';
    }

    return 'npm start';
  }

  /**
   * Get publish path based on scaffold config
   * Configures publish paths for different build tools
   */
  private getPublishPath(config: ScaffoldConfig): string {
    if (config.frontendFramework === 'nextjs') {
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
   * Get health check path based on scaffold config
   * Sets up health check paths for monitoring
   */
  private getHealthCheckPath(config: ScaffoldConfig): string {
    if (config.frontendFramework === 'nextjs') {
      return '/api/health';
    }

    if (config.backendFramework === 'express') {
      return '/health';
    }

    // For static sites, check the root
    return '/';
  }

  /**
   * Get runtime environment
   */
  private getRuntime(config: ScaffoldConfig): string {
    // Render supports: node, python, ruby, go, rust, elixir, docker
    if (config.frontendFramework || config.backendFramework) {
      return 'node';
    }
    return 'node';
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
}
