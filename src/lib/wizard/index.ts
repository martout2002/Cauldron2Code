/**
 * Wizard module exports
 * Provides state management, step configuration, and validation for the pixel-art wizard
 */

export { useWizardStore } from './wizard-state';
export type { StepConfig, StepOption, StepType } from './wizard-steps';
export {
  getWizardSteps,
  getStepByIndex,
  getStepById,
  getTotalSteps,
} from './wizard-steps';
export type { ValidationResult } from './wizard-validation';
export {
  validateStep,
  validateAllSteps,
  validateProjectName,
  validateDescription,
  validateFrontendFramework,
  validateBackendFramework,
  validateDatabase,
  validateAuth,
  validateStyling,
  validateExtras,
  canSkipStep,
} from './wizard-validation';
export {
  STORAGE_KEYS,
  hasPersistedWizardState,
  hasPersistedConfigState,
  getPersistedWizardState,
  getPersistedConfigState,
  clearPersistedState,
  validatePersistedState,
  getPersistedStateSummary,
  exportState,
  importState,
} from './wizard-persistence';
export type { CompatibilityRule, CompatibilityResult } from './compatibility-rules';
export { compatibilityRules } from './compatibility-rules';
export {
  evaluateCompatibility,
  evaluateMultipleOptions,
  hasIncompatibilities,
} from './compatibility-evaluator';
export { useCompatibility } from './useCompatibility';
export type { UseCompatibilityResult, OptionWithCompatibility } from './useCompatibility';
