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

export { ConfigurationAnalyzer } from './configuration-analyzer';

export { StepBuilder } from './step-builder';

export { ChecklistGenerator } from './checklist-generator';

export { TroubleshootingBuilder } from './troubleshooting-builder';

export { GuideGenerator } from './guide-generator';

export { PLATFORMS, getPlatformById, getRecommendedPlatforms } from './platforms';

export { GuideProgressManager, getGuideProgressManager } from './guide-progress-manager';

export { GuideExporter, getGuideExporter } from './guide-exporter';

export {
  generateConfigId,
  storeConfig,
  getConfigById,
  generateGuideUrl,
  createGuideUrl,
  cleanupOldConfigs,
  encodeConfigToUrl,
  decodeConfigFromUrl,
} from './guide-url-generator';

export {
  getDeploymentWorkflowDiagram,
  getMonorepoArchitectureDiagram,
  getFullStackArchitectureDiagram,
  getDatabaseSetupDiagram,
  getEnvVarsConfigDiagram,
  getOAuthCallbackDiagram,
  getTroubleshootingDiagram,
  getCICDPipelineDiagram,
  getDiagramForContext,
  exportDiagramAsMarkdown,
} from './architecture-diagrams';

export {
  GuideErrorHandler,
  getGuideErrorHandler,
  type GuideError,
  type GuideErrorCode,
  type ErrorContext,
} from './guide-error-handler';
