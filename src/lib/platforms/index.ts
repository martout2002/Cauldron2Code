/**
 * Platform Integration Module
 * Exports all platform-related types, interfaces, and utilities
 */

// Types
export type {
  PlatformType,
  PlatformConnection,
  EnvironmentVariable,
  DeploymentService,
  DeploymentConfig,
  PlatformProject,
  DeploymentStatus,
  DatabaseInfo,
  DeployedService,
  DeploymentError,
  Deployment,
  GeneratedFile,
} from './types';

// Platform Service Interface
export type { PlatformService } from './platform-service';

// Utilities
export { TokenEncryption } from './token-encryption';
export { DeploymentRateLimiter, getDeploymentRateLimiter } from './rate-limiter';
export { getRedisClient, createRedisClient } from './redis-client';
export {
  SecureTokenHandler,
  getSecureTokenHandler,
} from './secure-token-handler';
export {
  TokenCleanupService,
  getTokenCleanupService,
  initializeTokenCleanup,
} from './token-cleanup';

// Platform Integrations
export * from './vercel';
export * from './railway';
export * from './render';
