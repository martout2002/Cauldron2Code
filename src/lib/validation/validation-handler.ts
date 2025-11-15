/**
 * Validation handler for configuration
 * Manages validation state and prevents generation when errors exist
 */

import { ScaffoldConfig, ValidationError, ValidationWarning } from '@/types';
import { validateConfig } from './validator';

export interface ValidationState {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  canGenerate: boolean;
  validationMessage: string;
}

/**
 * Validate configuration and determine if generation can proceed
 */
export function validateForGeneration(
  config: ScaffoldConfig
): ValidationState {
  const result = validateConfig(config);

  const hasErrors = result.errors.length > 0;
  const hasWarnings = result.warnings.length > 0;

  // Generation can proceed if there are no errors (warnings are allowed)
  const canGenerate = !hasErrors;

  let validationMessage = '';
  if (hasErrors) {
    validationMessage = `Cannot generate: ${result.errors.length} error${result.errors.length > 1 ? 's' : ''} must be fixed`;
  } else if (hasWarnings) {
    validationMessage = `${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''} - generation can proceed`;
  } else {
    validationMessage = 'Configuration is valid';
  }

  return {
    isValid: result.isValid,
    hasErrors,
    hasWarnings,
    errors: result.errors,
    warnings: result.warnings,
    canGenerate,
    validationMessage,
  };
}

/**
 * Get user-friendly error messages with suggestions
 */
export function getErrorGuidance(error: ValidationError): {
  title: string;
  description: string;
  suggestions: string[];
} {
  const guidanceMap: Record<
    string,
    { title: string; description: string; suggestions: string[] }
  > = {
    'auth-database': {
      title: 'Authentication Requires Database',
      description:
        'You have selected an authentication provider but no database. Authentication systems need a database to store user data.',
      suggestions: [
        'Select a database option (Prisma, Drizzle, Supabase, or MongoDB)',
        'Or change authentication to "none" if you don\'t need auth',
      ],
    },
    'vercel-express': {
      title: 'Express Cannot Deploy to Vercel',
      description:
        'Vercel is optimized for Next.js applications and does not support standalone Express servers.',
      suggestions: [
        'Remove Vercel from deployment targets',
        'Use Railway, Render, or EC2 for Express deployments',
        'Or switch to Next.js or Monorepo framework',
      ],
    },
    'supabase-auth-db': {
      title: 'Supabase Auth Works Best with Supabase Database',
      description:
        'While you can use Supabase Auth with other databases, using Supabase as your database provides seamless integration.',
      suggestions: [
        'Consider selecting Supabase as your database for optimal integration',
        'Or continue with your current setup (this is just a recommendation)',
      ],
    },
    'trpc-monorepo': {
      title: 'tRPC Works Best in Monorepo or Next.js',
      description:
        'tRPC is designed for type-safe communication between frontend and backend. It works optimally in monorepo setups or Next.js with API routes.',
      suggestions: [
        'Consider using REST API for standalone Express applications',
        'Or switch to Monorepo framework for full tRPC benefits',
      ],
    },
    'ai-api-key': {
      title: 'AI Template Requires API Key',
      description:
        'AI templates use the Anthropic Claude API, which requires an API key to function.',
      suggestions: [
        'You will need to obtain an API key from https://console.anthropic.com',
        'Add ANTHROPIC_API_KEY to your environment variables after generation',
        'The generated code will include placeholder instructions',
      ],
    },
  };

  return (
    guidanceMap[error.ruleId] || {
      title: 'Configuration Error',
      description: error.message,
      suggestions: ['Review your configuration and try again'],
    }
  );
}

/**
 * Get user-friendly warning messages
 */
export function getWarningGuidance(warning: ValidationWarning): {
  title: string;
  description: string;
  suggestions: string[];
} {
  const guidanceMap: Record<
    string,
    { title: string; description: string; suggestions: string[] }
  > = {
    'supabase-auth-db': {
      title: 'Recommended: Use Supabase Database',
      description:
        'For the best experience with Supabase Auth, we recommend using Supabase as your database.',
      suggestions: [
        'Select Supabase as your database for seamless integration',
        'Or continue with your current database choice',
      ],
    },
    'trpc-monorepo': {
      title: 'tRPC Recommendation',
      description:
        'tRPC works best in monorepo setups where frontend and backend share types.',
      suggestions: [
        'Consider using REST API for simpler setups',
        'Or use Monorepo framework for full tRPC benefits',
      ],
    },
    'ai-api-key': {
      title: 'API Key Required',
      description:
        'You will need to provide an Anthropic API key to use AI features.',
      suggestions: [
        'Sign up at https://console.anthropic.com to get an API key',
        'Add the key to your .env file after generation',
      ],
    },
  };

  return (
    guidanceMap[warning.ruleId] || {
      title: 'Configuration Warning',
      description: warning.message,
      suggestions: ['This is a recommendation, not a requirement'],
    }
  );
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return errors[0]?.message || 'Unknown error';
  }

  return `${errors.length} configuration errors:\n${errors.map((e, i) => `${i + 1}. ${e.message}`).join('\n')}`;
}

/**
 * Check if configuration has critical errors that prevent generation
 */
export function hasCriticalErrors(errors: ValidationError[]): boolean {
  const criticalRules = ['auth-database', 'vercel-express'];
  return errors.some((error) => criticalRules.includes(error.ruleId));
}
