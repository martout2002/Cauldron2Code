import { ScaffoldConfig } from '@/types';
import { getStepByIndex } from './wizard-steps';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate project name
 * Requirements: required, lowercase, hyphens only
 */
export function validateProjectName(projectName: string): ValidationResult {
  if (!projectName || projectName.trim() === '') {
    return {
      isValid: false,
      error: 'Project name is required',
    };
  }

  if (projectName.length > 50) {
    return {
      isValid: false,
      error: 'Project name must be 50 characters or less',
    };
  }

  // Must be lowercase alphanumeric with hyphens only
  const validPattern = /^[a-z0-9-]+$/;
  if (!validPattern.test(projectName)) {
    return {
      isValid: false,
      error: 'Use lowercase letters, numbers, and hyphens only',
    };
  }

  // Cannot start or end with hyphen
  if (projectName.startsWith('-') || projectName.endsWith('-')) {
    return {
      isValid: false,
      error: 'Project name cannot start or end with a hyphen',
    };
  }

  // Cannot have consecutive hyphens
  if (projectName.includes('--')) {
    return {
      isValid: false,
      error: 'Project name cannot have consecutive hyphens',
    };
  }

  return { isValid: true };
}

/**
 * Validate project description
 */
export function validateDescription(description: string): ValidationResult {
  if (!description || description.trim() === '') {
    return {
      isValid: false,
      error: 'Description is required',
    };
  }

  if (description.length > 200) {
    return {
      isValid: false,
      error: 'Description must be 200 characters or less',
    };
  }

  return { isValid: true };
}

/**
 * Validate frontend framework selection
 */
export function validateFrontendFramework(
  framework: ScaffoldConfig['frontendFramework']
): ValidationResult {
  const validOptions: ScaffoldConfig['frontendFramework'][] = [
    'nextjs',
    'react',
    'vue',
    'angular',
    'svelte',
  ];

  if (!framework || !validOptions.includes(framework)) {
    return {
      isValid: false,
      error: 'Please select a frontend framework',
    };
  }

  return { isValid: true };
}

/**
 * Validate backend framework selection
 */
export function validateBackendFramework(
  framework: ScaffoldConfig['backendFramework']
): ValidationResult {
  const validOptions: ScaffoldConfig['backendFramework'][] = [
    'none',
    'nextjs-api',
    'express',
    'fastify',
    'nestjs',
  ];

  if (!framework || !validOptions.includes(framework)) {
    return {
      isValid: false,
      error: 'Please select a backend option',
    };
  }

  return { isValid: true };
}

/**
 * Validate database selection
 */
export function validateDatabase(
  database: ScaffoldConfig['database']
): ValidationResult {
  const validOptions: ScaffoldConfig['database'][] = [
    'none',
    'prisma-postgres',
    'drizzle-postgres',
    'supabase',
    'mongodb',
  ];

  if (!database || !validOptions.includes(database)) {
    return {
      isValid: false,
      error: 'Please select a database option',
    };
  }

  return { isValid: true };
}

/**
 * Validate authentication selection
 */
export function validateAuth(auth: ScaffoldConfig['auth']): ValidationResult {
  const validOptions: ScaffoldConfig['auth'][] = [
    'none',
    'nextauth',
    'supabase',
    'clerk',
  ];

  if (!auth || !validOptions.includes(auth)) {
    return {
      isValid: false,
      error: 'Please select an authentication option',
    };
  }

  return { isValid: true };
}

/**
 * Validate styling selection
 */
export function validateStyling(
  styling: ScaffoldConfig['styling']
): ValidationResult {
  const validOptions: ScaffoldConfig['styling'][] = [
    'tailwind',
    'css-modules',
    'styled-components',
  ];

  if (!styling || !validOptions.includes(styling)) {
    return {
      isValid: false,
      error: 'Please select a styling option',
    };
  }

  return { isValid: true };
}

/**
 * Validate extras (no specific validation needed, but ensure it's an object)
 */
export function validateExtras(
  extras: ScaffoldConfig['extras']
): ValidationResult {
  if (!extras || typeof extras !== 'object') {
    return {
      isValid: false,
      error: 'Invalid extras configuration',
    };
  }

  return { isValid: true };
}

/**
 * Validate a specific wizard step based on its index
 */
export function validateStep(
  stepIndex: number,
  config: ScaffoldConfig
): ValidationResult {
  const step = getStepByIndex(stepIndex);

  if (!step) {
    return {
      isValid: false,
      error: 'Invalid step',
    };
  }

  // Get the value for this step's field
  const value = config[step.field];

  // Apply step-specific validation
  switch (step.id) {
    case 'project-name':
      return validateProjectName(value as string);

    case 'description':
      return validateDescription(value as string);

    case 'frontend':
      return validateFrontendFramework(
        value as ScaffoldConfig['frontendFramework']
      );

    case 'backend':
      return validateBackendFramework(
        value as ScaffoldConfig['backendFramework']
      );

    case 'database':
      return validateDatabase(value as ScaffoldConfig['database']);

    case 'auth':
      return validateAuth(value as ScaffoldConfig['auth']);

    case 'styling':
      return validateStyling(value as ScaffoldConfig['styling']);

    case 'extras':
      return validateExtras(value as ScaffoldConfig['extras']);

    default:
      return { isValid: true };
  }
}

/**
 * Validate all wizard steps
 * Returns true if all steps are valid
 */
export function validateAllSteps(config: ScaffoldConfig): ValidationResult {
  const totalSteps = 8;

  for (let i = 0; i < totalSteps; i++) {
    const result = validateStep(i, config);
    if (!result.isValid) {
      return {
        isValid: false,
        error: `Step ${i + 1}: ${result.error}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Check if a step can be skipped (optional steps)
 * Currently all steps are required, but this allows for future flexibility
 */
export function canSkipStep(_stepIndex: number): boolean {
  // All steps are currently required
  // This function can be extended in the future for optional steps
  return false;
}
