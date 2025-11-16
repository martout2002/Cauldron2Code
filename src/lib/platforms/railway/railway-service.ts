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
import { getRailwayOAuthService } from './oauth';

/**
 * Railway Platform Service
 * Implements the PlatformService interface for Railway deployments
 */
export class RailwayService implements PlatformService {
  private accessToken: string;
  private baseUrl = 'https://backboard.railway.app/graphql/v2';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuth(): Promise<string> {
    const service = getRailwayOAuthService();
    const state = service.generateState();
    return service.getAuthorizationUrl(state);
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string): Promise<PlatformConnection> {
    const service = getRailwayOAuthService();
    const tokens = await service.exchangeCodeForToken(code);
    const user = await service.getUserInfo(tokens.accessToken);

    // Create connection with a placeholder userId (should be set by caller)
    return service.createConnection('placeholder', tokens, user);
  }

  /**
   * Refresh access token
   */
  async refreshToken(connection: PlatformConnection): Promise<PlatformConnection> {
    return getRailwayOAuthService().refreshToken(connection);
  }

  /**
   * Execute GraphQL query
   */
  private async graphqlRequest<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Railway API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(
        `Railway GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`
      );
    }

    return data.data;
  }

  /**
   * Create a new project on Railway
   */
  async createProject(config: DeploymentConfig): Promise<PlatformProject> {
    // Create project
    const createProjectMutation = `
      mutation ProjectCreate($name: String!) {
        projectCreate(input: { name: $name }) {
          id
          name
          createdAt
        }
      }
    `;

    const projectData = await this.graphqlRequest<{
      projectCreate: { id: string; name: string; createdAt: string };
    }>(createProjectMutation, {
      name: config.projectName,
    });

    const project = projectData.projectCreate;

    // Create service for the project
    await this.createService(project.id, config);

    return {
      id: project.id,
      name: project.name,
      url: `https://${config.projectName}.up.railway.app`,
      platform: 'railway',
      createdAt: new Date(project.createdAt),
    };
  }

  /**
   * Create a service within a project
   * Configures Nixpacks builder and service settings
   */
  private async createService(
    projectId: string,
    config: DeploymentConfig
  ): Promise<string> {
    const mutation = `
      mutation ServiceCreate($projectId: String!, $name: String!, $source: ServiceSourceInput) {
        serviceCreate(input: { projectId: $projectId, name: $name, source: $source }) {
          id
        }
      }
    `;

    // Configure Nixpacks builder settings
    const nixpacksConfig = this.getNixpacksConfig(config.scaffoldConfig);
    const healthCheckConfig = this.getHealthCheckConfig(config.scaffoldConfig);

    const data = await this.graphqlRequest<{
      serviceCreate: { id: string };
    }>(mutation, {
      projectId,
      name: config.services[0]?.name || 'web',
      source: {
        ...nixpacksConfig,
      },
    });

    const serviceId = data.serviceCreate.id;

    // Configure health checks after service creation
    await this.configureHealthCheck(serviceId, healthCheckConfig);

    return serviceId;
  }

  /**
   * Get Nixpacks configuration based on scaffold config
   * Configures Nixpacks builder for optimal Railway deployment
   */
  private getNixpacksConfig(config: ScaffoldConfig): Record<string, any> {
    const nixpacksConfig: Record<string, any> = {};

    // Set build command
    nixpacksConfig.buildCommand = this.getBuildCommand(config);
    
    // Set start command
    nixpacksConfig.startCommand = this.getStartCommand(config);

    // Configure Node.js version
    nixpacksConfig.nixpacksPlan = {
      phases: {
        setup: {
          nixPkgs: ['nodejs-18_x'],
        },
        install: {
          cmds: ['npm install'],
        },
        build: {
          cmds: [this.getBuildCommand(config)],
        },
      },
      start: {
        cmd: this.getStartCommand(config),
      },
    };

    return nixpacksConfig;
  }

  /**
   * Get health check configuration
   * Configures health checks for Railway services
   */
  private getHealthCheckConfig(config: ScaffoldConfig): {
    path: string;
    timeout: number;
    interval: number;
  } {
    let healthCheckPath = '/health';

    // Framework-specific health check paths
    if (config.frontendFramework === 'nextjs') {
      healthCheckPath = '/api/health';
    } else if (config.backendFramework === 'express') {
      healthCheckPath = '/health';
    }

    return {
      path: healthCheckPath,
      timeout: 10,
      interval: 30,
    };
  }

  /**
   * Configure health check for a service
   */
  private async configureHealthCheck(
    serviceId: string,
    healthCheck: { path: string; timeout: number; interval: number }
  ): Promise<void> {
    const mutation = `
      mutation ServiceUpdate($serviceId: String!, $healthCheckPath: String!, $healthCheckTimeout: Int!, $healthCheckInterval: Int!) {
        serviceUpdate(
          id: $serviceId
          input: {
            healthCheckPath: $healthCheckPath
            healthCheckTimeout: $healthCheckTimeout
            healthCheckInterval: $healthCheckInterval
          }
        ) {
          id
        }
      }
    `;

    await this.graphqlRequest(mutation, {
      serviceId,
      healthCheckPath: healthCheck.path,
      healthCheckTimeout: healthCheck.timeout,
      healthCheckInterval: healthCheck.interval,
    });
  }

  /**
   * Check if project name is available
   */
  async checkProjectNameAvailability(name: string): Promise<boolean> {
    try {
      const query = `
        query Projects {
          projects {
            edges {
              node {
                name
              }
            }
          }
        }
      `;

      const data = await this.graphqlRequest<{
        projects: { edges: Array<{ node: { name: string } }> };
      }>(query);

      // Check if name already exists
      const existingNames = data.projects.edges.map((edge) => edge.node.name);
      return !existingNames.includes(name);
    } catch {
      // If there's an error, assume name is available
      return true;
    }
  }

  /**
   * Upload files to Railway
   */
  async uploadFiles(projectId: string, files: GeneratedFile[]): Promise<void> {
    // Railway uses source-based deployment
    // We need to create a deployment from the files
    const mutation = `
      mutation DeploymentCreate($serviceId: String!, $repo: DeploymentRepoInput!) {
        deploymentCreate(input: { serviceId: $serviceId, repo: $repo }) {
          id
        }
      }
    `;

    // Get the service ID for this project
    const serviceId = await this.getServiceId(projectId);

    // Convert files to Railway format
    // Note: Railway typically works with git repos, but we'll use their API
    // to create a deployment from raw files
    const railwayFiles = files.map((f) => ({
      path: f.path,
      content: Buffer.from(f.content).toString('base64'),
    }));

    // For Railway, we need to use their deployment API
    // This is a simplified version - in production, you might need to
    // create a temporary git repo or use Railway's CLI
    await this.graphqlRequest(mutation, {
      serviceId,
      repo: {
        files: railwayFiles,
      },
    });
  }

  /**
   * Get service ID for a project
   */
  private async getServiceId(projectId: string): Promise<string> {
    const query = `
      query Project($id: String!) {
        project(id: $id) {
          services {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `;

    const data = await this.graphqlRequest<{
      project: { services: { edges: Array<{ node: { id: string } }> } };
    }>(query, { id: projectId });

    const services = data.project.services.edges;
    if (services.length === 0) {
      throw new Error('No services found for project');
    }

    const firstService = services[0];
    if (!firstService) {
      throw new Error('No services found for project');
    }

    return firstService.node.id;
  }

  /**
   * Set environment variables for a project
   */
  async setEnvironmentVariables(
    projectId: string,
    vars: EnvironmentVariable[]
  ): Promise<void> {
    const serviceId = await this.getServiceId(projectId);

    for (const envVar of vars) {
      const mutation = `
        mutation VariableUpsert($serviceId: String!, $name: String!, $value: String!) {
          variableUpsert(input: { 
            serviceId: $serviceId, 
            name: $name, 
            value: $value 
          }) {
            id
          }
        }
      `;

      await this.graphqlRequest(mutation, {
        serviceId,
        name: envVar.key,
        value: envVar.value,
      });
    }
  }

  /**
   * Trigger a deployment
   */
  async triggerDeployment(projectId: string): Promise<DeploymentStatus> {
    const serviceId = await this.getServiceId(projectId);

    const mutation = `
      mutation ServiceInstanceRedeploy($serviceId: String!) {
        serviceInstanceRedeploy(serviceId: $serviceId)
      }
    `;

    await this.graphqlRequest(mutation, { serviceId });

    return {
      state: 'queued',
    };
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    const query = `
      query Deployment($id: String!) {
        deployment(id: $id) {
          status
          url
          createdAt
        }
      }
    `;

    const data = await this.graphqlRequest<{
      deployment: {
        status: string;
        url?: string;
        createdAt: string;
      };
    }>(query, { id: deploymentId });

    const deployment = data.deployment;

    // Map Railway states to our states
    const stateMap: Record<string, DeploymentStatus['state']> = {
      BUILDING: 'building',
      DEPLOYING: 'deploying',
      SUCCESS: 'ready',
      FAILED: 'error',
      CRASHED: 'error',
      REMOVED: 'canceled',
      INITIALIZING: 'queued',
    };

    return {
      state: stateMap[deployment.status] || 'queued',
      url: deployment.url,
      readyAt: deployment.status === 'SUCCESS' ? new Date(deployment.createdAt) : undefined,
    };
  }

  /**
   * Stream build logs
   */
  async *streamBuildLogs(deploymentId: string): AsyncIterableIterator<string> {
    // Railway provides build logs through their GraphQL API
    const query = `
      query DeploymentLogs($id: String!) {
        deployment(id: $id) {
          buildLogs
        }
      }
    `;

    const data = await this.graphqlRequest<{
      deployment: { buildLogs: string };
    }>(query, { id: deploymentId });

    // Split logs by newline and yield each line
    const logs = data.deployment.buildLogs || '';
    const lines = logs.split('\n');

    for (const line of lines) {
      if (line.trim()) {
        yield line;
      }
    }
  }

  /**
   * Provision a database on Railway
   * Adds automatic database provisioning with Railway plugins
   */
  async provisionDatabase(
    type: 'postgres' | 'mysql' | 'mongodb',
    projectId?: string
  ): Promise<DatabaseInfo> {
    // Get the current project ID from context if not provided
    const targetProjectId = projectId || (await this.getCurrentProjectId());

    const mutation = `
      mutation PluginCreate($projectId: String!, $type: String!) {
        pluginCreate(input: { projectId: $projectId, type: $type }) {
          id
        }
      }
    `;

    // Map database types to Railway plugin types
    const pluginTypeMap: Record<string, string> = {
      postgres: 'postgresql',
      mysql: 'mysql',
      mongodb: 'mongodb',
    };

    const data = await this.graphqlRequest<{
      pluginCreate: { id: string };
    }>(mutation, {
      projectId: targetProjectId,
      type: pluginTypeMap[type],
    });

    const pluginId = data.pluginCreate.id;

    // Wait for plugin to be ready
    await this.waitForPluginReady(pluginId);

    // Get connection info
    const connectionInfo = await this.getDatabaseConnectionInfo(pluginId);

    return connectionInfo;
  }

  /**
   * Wait for database plugin to be ready
   */
  private async waitForPluginReady(pluginId: string, maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const query = `
        query Plugin($id: String!) {
          plugin(id: $id) {
            status
          }
        }
      `;

      const data = await this.graphqlRequest<{
        plugin: { status: string };
      }>(query, { id: pluginId });

      if (data.plugin.status === 'READY') {
        return;
      }

      // Wait 2 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Database provisioning timed out');
  }

  /**
   * Get database connection information
   */
  private async getDatabaseConnectionInfo(pluginId: string): Promise<DatabaseInfo> {
    const query = `
      query Plugin($id: String!) {
        plugin(id: $id) {
          variables {
            DATABASE_URL
            DATABASE_HOST
            DATABASE_PORT
            DATABASE_NAME
            DATABASE_USER
            DATABASE_PASSWORD
          }
        }
      }
    `;

    const data = await this.graphqlRequest<{
      plugin: {
        variables: {
          DATABASE_URL: string;
          DATABASE_HOST: string;
          DATABASE_PORT: string;
          DATABASE_NAME: string;
          DATABASE_USER: string;
          DATABASE_PASSWORD: string;
        };
      };
    }>(query, { id: pluginId });

    const vars = data.plugin.variables;

    return {
      connectionString: vars.DATABASE_URL,
      host: vars.DATABASE_HOST,
      port: parseInt(vars.DATABASE_PORT),
      database: vars.DATABASE_NAME,
      username: vars.DATABASE_USER,
      password: vars.DATABASE_PASSWORD,
    };
  }

  /**
   * Get current project ID (helper method)
   */
  private async getCurrentProjectId(): Promise<string> {
    const query = `
      query Projects {
        projects {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const data = await this.graphqlRequest<{
      projects: { edges: Array<{ node: { id: string } }> };
    }>(query);

    const projects = data.projects.edges;
    if (projects.length === 0) {
      throw new Error('No projects found');
    }

    // Return the first project (in a real implementation, this would be more sophisticated)
    const firstProject = projects[0];
    if (!firstProject) {
      throw new Error('No project available');
    }
    return firstProject.node.id;
  }

  /**
   * Get build command based on scaffold config
   */
  private getBuildCommand(config: ScaffoldConfig): string {
    if (config.projectStructure === 'fullstack-monorepo') {
      return 'npm install && npm run build --filter=web';
    }
    return 'npm install && npm run build';
  }

  /**
   * Get start command based on scaffold config
   */
  private getStartCommand(config: ScaffoldConfig): string {
    if (config.frontendFramework === 'nextjs') return 'npm start';
    if (config.backendFramework === 'express') return 'node dist/server.js';
    return 'npm start';
  }
}
