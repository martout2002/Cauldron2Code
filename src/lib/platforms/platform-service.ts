/**
 * Platform Service Interface
 * Base interface that all platform integrations must implement
 */

import type {
  PlatformConnection,
  DeploymentConfig,
  PlatformProject,
  EnvironmentVariable,
  DeploymentStatus,
  DatabaseInfo,
  GeneratedFile,
} from './types';

export interface PlatformService {
  // Authentication
  initiateOAuth(): Promise<string>; // Returns auth URL
  handleCallback(code: string): Promise<PlatformConnection>;
  refreshToken(connection: PlatformConnection): Promise<PlatformConnection>;

  // Project Management
  createProject(config: DeploymentConfig): Promise<PlatformProject>;
  checkProjectNameAvailability(name: string): Promise<boolean>;

  // Deployment
  uploadFiles(projectId: string, files: GeneratedFile[]): Promise<void>;
  setEnvironmentVariables(
    projectId: string,
    vars: EnvironmentVariable[]
  ): Promise<void>;
  triggerDeployment(projectId: string): Promise<DeploymentStatus>;

  // Monitoring
  getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;
  streamBuildLogs(deploymentId: string): AsyncIterableIterator<string>;

  // Database (optional - not all platforms support this)
  provisionDatabase?(
    type: 'postgres' | 'mysql' | 'mongodb'
  ): Promise<DatabaseInfo>;
}
