import { ScaffoldConfig } from '@/types';
import { getStepByIndex } from './wizard-steps';
import { VALIDATION_RULES } from '@/lib/validation/rules';

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
 * Validate AI template selection
 * AI templates are optional, so no validation is required
 * Requirements: 4.1, 4.4
 */
export function validateAITemplateStep(
  aiTemplates: ScaffoldConfig['aiTemplates']
): ValidationResult {
  // AI templates are optional - empty array is valid
  if (!aiTemplates) {
    // If undefined, treat as valid (will be initialized as empty array)
    return { isValid: true };
  }
  
  if (!Array.isArray(aiTemplates)) {
    return {
      isValid: false,
      error: 'Invalid AI templates configuration',
    };
  }

  // Empty array is explicitly valid - user chose no AI templates
  if (aiTemplates.length === 0) {
    return { isValid: true };
  }

  // Validate each template is a valid option
  const validTemplates = [
    'chatbot',
    'document-analyzer',
    'semantic-search',
    'code-assistant',
    'image-generator',
  ];

  for (const template of aiTemplates) {
    if (!validTemplates.includes(template)) {
      return {
        isValid: false,
        error: `Invalid AI template: ${template}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate AI provider selection
 * Provider is required when AI templates are selected
 * Requirements: 4.1, 4.4
 */
export function validateAIProviderStep(
  config: ScaffoldConfig
): ValidationResult {
  const { aiTemplates, aiProvider } = config;

  // If no templates selected, provider validation is not needed
  if (!aiTemplates || aiTemplates.length === 0) {
    return { isValid: true };
  }

  // If templates are selected, provider is required
  if (!aiProvider) {
    return {
      isValid: false,
      error: 'Please select an AI provider for your templates',
    };
  }

  // Validate provider is a valid option
  const validProviders: ScaffoldConfig['aiProvider'][] = [
    'anthropic',
    'openai',
    'aws-bedrock',
    'gemini',
  ];

  if (!validProviders.includes(aiProvider)) {
    return {
      isValid: false,
      error: `Invalid AI provider: ${aiProvider}`,
    };
  }

  return { isValid: true };
}

/**
 * Check compatibility rules that affect the current configuration
 * Returns the first error found, or null if all checks pass
 * 
 * Note: We only check rules that are relevant to fields that have been set.
 * This prevents blocking navigation on steps where the user hasn't made choices yet.
 */
function checkCompatibilityRules(config: ScaffoldConfig): string | null {
  // Run all error-level validation rules, but skip rules that check
  // fields that haven't been set yet (still have default values)
  const errorRules = VALIDATION_RULES.filter(rule => rule.severity === 'error');
  
  for (const rule of errorRules) {
    // Skip rules that would fail due to unset fields
    // These rules will be checked when the user reaches those steps
    
    // Skip nextjs-router-required if we haven't selected Next.js yet
    if (rule.id === 'nextjs-router-required' && config.frontendFramework !== 'nextjs') {
      continue;
    }
    
    // Skip auth-database if auth is still 'none' (default)
    if (rule.id === 'auth-database' && config.auth === 'none') {
      continue;
    }
    
    // Skip vercel-express if deployment hasn't been set yet
    if (rule.id === 'vercel-express' && config.deployment.length === 0) {
      continue;
    }
    
    // Skip ai-framework-compatibility if no AI templates selected yet
    if (rule.id === 'ai-framework-compatibility' && config.aiTemplates.length === 0) {
      continue;
    }
    
    const isViolated = rule.check(config);
    if (isViolated) {
      return rule.message;
    }
  }
  
  return null;
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
  let stepValidation: ValidationResult;
  
  switch (step.id) {
    case 'project-name':
      stepValidation = validateProjectName(value as string);
      break;

    case 'description':
      stepValidation = validateDescription(value as string);
      break;

    case 'frontend':
      stepValidation = validateFrontendFramework(
        value as ScaffoldConfig['frontendFramework']
      );
      break;

    case 'backend':
      stepValidation = validateBackendFramework(
        value as ScaffoldConfig['backendFramework']
      );
      break;

    case 'build-tool':
      // Build tool is always valid (auto is default)
      stepValidation = { isValid: true };
      break;

    case 'database':
      stepValidation = validateDatabase(value as ScaffoldConfig['database']);
      break;

    case 'auth':
      stepValidation = validateAuth(value as ScaffoldConfig['auth']);
      break;

    case 'styling':
      stepValidation = validateStyling(value as ScaffoldConfig['styling']);
      break;

    case 'extras':
      stepValidation = validateExtras(value as ScaffoldConfig['extras']);
      break;

    case 'ai-templates':
      stepValidation = validateAITemplateStep(value as ScaffoldConfig['aiTemplates']);
      break;

    case 'ai-provider':
      stepValidation = validateAIProviderStep(config);
      break;

    case 'summary':
      // Summary step is always valid (just a review)
      stepValidation = { isValid: true };
      break;

    case 'github-auth':
      // GitHub auth step is always valid (OAuth happens on next)
      stepValidation = { isValid: true };
      break;

    default:
      stepValidation = { isValid: true };
  }
  
  // If step-specific validation failed, return that error
  if (!stepValidation.isValid) {
    return stepValidation;
  }
  
  // Check compatibility rules across the entire configuration
  const compatibilityError = checkCompatibilityRules(config);
  if (compatibilityError) {
    return {
      isValid: false,
      error: compatibilityError,
    };
  }
  
  return { isValid: true };
}

/**
 * Validate all wizard steps
 * Returns true if all steps are valid
 */
export function validateAllSteps(config: ScaffoldConfig): ValidationResult {
  const totalSteps = 13; // Updated to include AI templates, AI provider, summary, and github-auth steps

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
