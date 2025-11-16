/**
 * Deployment Library
 * 
 * Provides environment variable detection, validation, and management
 * for automated deployment to hosting platforms.
 */

export {
  EnvironmentVariableDetector,
  type EnvironmentVariable,
} from './environment-detector';

export {
  EnvironmentVariableValidator,
  type ValidationResult,
} from './environment-validator';

export {
  DeploymentOrchestrator,
  getDeploymentOrchestrator,
} from './deployment-orchestrator';

export {
  DeploymentErrorHandler,
  getDeploymentErrorHandler,
  type RecoveryAction,
} from './error-handler';

export {
  ProgressTracker,
  getProgressTracker,
  type ProgressUpdate,
} from './progress-tracker';

export {
  DeploymentStore,
  getDeploymentStore,
} from './deployment-store';

export {
  PostDeploymentChecklistGenerator,
  type ChecklistItem,
} from './checklist-generator';

export {
  MonorepoDeploymentStrategy,
  getMonorepoDeploymentStrategy,
} from './monorepo-strategy';

export {
  FileFilter,
  createFileFilter,
  filterFilesForService,
  type FileFilterConfig,
  type FileFilterStats,
  type FileValidationResult,
} from './file-filter';

export {
  DeploymentCache,
  getDeploymentCache,
  CacheKeys,
  CacheTTL,
  type CacheEntry,
} from './deployment-cache';

export type { ServiceProgress } from './progress-tracker';

export {
  getEnvVarHelp,
  getAllEnvVarHelp,
  type EnvVarHelpInfo,
} from './environment-variable-help';
