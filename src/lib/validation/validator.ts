import {
  ScaffoldConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '@/types';
import { VALIDATION_RULES } from './rules';

/**
 * Validates a scaffold configuration against all validation rules
 * @param config - The scaffold configuration to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateConfig(config: ScaffoldConfig): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Run all validation rules
  for (const rule of VALIDATION_RULES) {
    const isViolated = rule.check(config);

    if (isViolated) {
      if (rule.severity === 'error') {
        errors.push({
          field: extractFieldFromRule(rule.id),
          message: rule.message,
          ruleId: rule.id,
        });
      } else {
        warnings.push({
          field: extractFieldFromRule(rule.id),
          message: rule.message,
          ruleId: rule.id,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract the primary field name from a rule ID
 * Used for grouping validation messages by field
 */
function extractFieldFromRule(ruleId: string): string {
  // Map rule IDs to their primary field
  const fieldMap: Record<string, string> = {
    'auth-database': 'auth',
    'vercel-express': 'deployment',
    'trpc-monorepo': 'api',
    'ai-api-key': 'aiTemplate',
    'supabase-auth-db': 'auth',
    'nextjs-router-required': 'nextjsRouter',
    'project-name-required': 'projectName',
    'description-required': 'description',
    'deployment-target-required': 'deployment',
    'graphql-complexity': 'api',
    'mongodb-auth-compatibility': 'database',
    'docker-deployment-recommendation': 'extras',
  };

  return fieldMap[ruleId] || 'general';
}

/**
 * Check if configuration has any blocking errors
 */
export function hasBlockingErrors(result: ValidationResult): boolean {
  return result.errors.length > 0;
}

/**
 * Get all validation messages (errors and warnings combined)
 */
export function getAllMessages(
  result: ValidationResult
): Array<ValidationError | ValidationWarning> {
  return [...result.errors, ...result.warnings];
}

/**
 * Filter validation results by field
 */
export function getMessagesByField(
  result: ValidationResult,
  field: string
): Array<ValidationError | ValidationWarning> {
  const allMessages = getAllMessages(result);
  return allMessages.filter((msg) => msg.field === field);
}
