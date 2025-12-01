/**
 * Deployment Library
 * 
 * Provides deployment guide generation and configuration management
 * for the deployment guides feature.
 */

// Environment variable utilities
export {
  EnvironmentVariableDetector,
  type EnvironmentVariable,
} from './environment-detector';

export {
  EnvironmentVariableValidator,
  type ValidationResult,
} from './environment-validator';

export {
  getEnvVarHelp,
  getAllEnvVarHelp,
  type EnvVarHelpInfo,
} from './environment-variable-help';

// Guide generation
export { ConfigurationAnalyzer } from './configuration-analyzer';
export { StepBuilder } from './step-builder';
export { ChecklistGenerator } from './checklist-generator';
export { TroubleshootingBuilder } from './troubleshooting-builder';
export { GuideGenerator } from './guide-generator';

// Platform utilities
export { PLATFORMS, getPlatformById, getRecommendedPlatforms } from './platforms';

// Guide management
export { GuideProgressManager, getGuideProgressManager } from './guide-progress-manager';
export { GuideExporter, getGuideExporter } from './guide-exporter';

// Config URL management
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

// Architecture diagrams
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

// Error handling
export {
  GuideErrorHandler,
  getGuideErrorHandler,
  type GuideError,
  type GuideErrorCode,
  type ErrorContext,
} from './guide-error-handler';
