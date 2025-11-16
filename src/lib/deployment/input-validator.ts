/**
 * Input Validation and Sanitization
 * Validates and sanitizes user inputs to prevent injection attacks
 * and ensure compliance with platform requirements
 */

/**
 * Platform-specific project name rules
 */
const PLATFORM_RULES = {
  vercel: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-z0-9-]+$/,
    description: 'lowercase letters, numbers, and hyphens only',
    reservedNames: ['api', 'www', 'vercel', 'now'],
  },
  railway: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-z0-9-]+$/,
    description: 'lowercase letters, numbers, and hyphens only',
    reservedNames: ['railway', 'app', 'api'],
  },
  render: {
    minLength: 3,
    maxLength: 63,
    pattern: /^[a-z0-9-]+$/,
    description: 'lowercase letters, numbers, and hyphens only',
    reservedNames: ['render', 'api', 'www'],
  },
} as const;

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Input Validator for deployment configurations
 */
export class InputValidator {
  /**
   * Validate and sanitize project name for a specific platform
   */
  validateProjectName(
    projectName: string,
    platform: 'vercel' | 'railway' | 'render'
  ): ValidationResult {
    // Get platform-specific rules
    const rules = PLATFORM_RULES[platform];

    // Check if empty
    if (!projectName || typeof projectName !== 'string') {
      return {
        isValid: false,
        error: 'Project name is required',
      };
    }

    // Trim whitespace
    const trimmed = projectName.trim();

    // Check length
    if (trimmed.length < rules.minLength) {
      return {
        isValid: false,
        error: `Project name must be at least ${rules.minLength} characters`,
      };
    }

    if (trimmed.length > rules.maxLength) {
      return {
        isValid: false,
        error: `Project name must be at most ${rules.maxLength} characters`,
      };
    }

    // Check pattern
    if (!rules.pattern.test(trimmed)) {
      return {
        isValid: false,
        error: `Project name must contain ${rules.description}`,
      };
    }

    // Check for reserved names
    if (rules.reservedNames.includes(trimmed as any)) {
      return {
        isValid: false,
        error: `"${trimmed}" is a reserved name and cannot be used`,
      };
    }

    // Check for consecutive hyphens
    if (trimmed.includes('--')) {
      return {
        isValid: false,
        error: 'Project name cannot contain consecutive hyphens',
      };
    }

    // Check for leading/trailing hyphens
    if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
      return {
        isValid: false,
        error: 'Project name cannot start or end with a hyphen',
      };
    }

    return {
      isValid: true,
      sanitized: trimmed,
    };
  }

  /**
   * Sanitize project name to make it platform-compliant
   */
  sanitizeProjectName(projectName: string): string {
    if (!projectName) return '';

    return projectName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
      .replace(/--+/g, '-') // Replace consecutive hyphens with single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .slice(0, 50); // Limit length to safe maximum
  }

  /**
   * Validate environment variable key
   */
  validateEnvVarKey(key: string): ValidationResult {
    if (!key || typeof key !== 'string') {
      return {
        isValid: false,
        error: 'Environment variable key is required',
      };
    }

    const trimmed = key.trim();

    // Check pattern (uppercase letters, numbers, underscores)
    if (!/^[A-Z_][A-Z0-9_]*$/.test(trimmed)) {
      return {
        isValid: false,
        error: 'Environment variable key must contain only uppercase letters, numbers, and underscores',
      };
    }

    // Check length
    if (trimmed.length > 255) {
      return {
        isValid: false,
        error: 'Environment variable key is too long',
      };
    }

    return {
      isValid: true,
      sanitized: trimmed,
    };
  }

  /**
   * Validate environment variable value
   */
  validateEnvVarValue(value: string, sensitive: boolean = false): ValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: 'Environment variable value cannot be null or undefined',
      };
    }

    // Convert to string if not already
    const stringValue = String(value);

    // Check for null bytes (potential injection)
    if (stringValue.includes('\0')) {
      return {
        isValid: false,
        error: 'Environment variable value contains invalid characters',
      };
    }

    // Check length (reasonable limit)
    if (stringValue.length > 10000) {
      return {
        isValid: false,
        error: 'Environment variable value is too long',
      };
    }

    // For sensitive values, check for common mistakes
    if (sensitive) {
      // Check if value looks like a placeholder
      if (
        stringValue.includes('YOUR_') ||
        stringValue.includes('REPLACE_') ||
        stringValue.includes('xxx') ||
        stringValue === 'changeme'
      ) {
        return {
          isValid: false,
          error: 'Environment variable value appears to be a placeholder',
        };
      }
    }

    return {
      isValid: true,
      sanitized: stringValue,
    };
  }

  /**
   * Sanitize string to prevent injection attacks
   */
  sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .replace(/\0/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim();
  }

  /**
   * Validate team/organization ID
   */
  validateTeamId(teamId: string): ValidationResult {
    if (!teamId || typeof teamId !== 'string') {
      return {
        isValid: false,
        error: 'Team ID is required',
      };
    }

    const trimmed = teamId.trim();

    // Check pattern (alphanumeric and hyphens/underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return {
        isValid: false,
        error: 'Team ID contains invalid characters',
      };
    }

    // Check length
    if (trimmed.length > 100) {
      return {
        isValid: false,
        error: 'Team ID is too long',
      };
    }

    return {
      isValid: true,
      sanitized: trimmed,
    };
  }

  /**
   * Validate deployment configuration object
   */
  validateDeploymentConfig(config: any): {
    isValid: boolean;
    errors: string[];
    sanitized?: any;
  } {
    const errors: string[] = [];
    const sanitized: any = {};

    // Validate project name
    if (!config.projectName) {
      errors.push('Project name is required');
    } else {
      const projectNameResult = this.validateProjectName(
        config.projectName,
        config.platform
      );
      if (!projectNameResult.isValid) {
        errors.push(projectNameResult.error!);
      } else {
        sanitized.projectName = projectNameResult.sanitized;
      }
    }

    // Validate platform
    if (!config.platform || !['vercel', 'railway', 'render'].includes(config.platform)) {
      errors.push('Valid platform is required (vercel, railway, or render)');
    } else {
      sanitized.platform = config.platform;
    }

    // Validate scaffold config
    if (!config.scaffoldConfig || typeof config.scaffoldConfig !== 'object') {
      errors.push('Scaffold configuration is required');
    } else {
      sanitized.scaffoldConfig = config.scaffoldConfig;
    }

    // Validate environment variables
    if (!Array.isArray(config.environmentVariables)) {
      errors.push('Environment variables must be an array');
    } else {
      sanitized.environmentVariables = [];

      for (const envVar of config.environmentVariables) {
        // Validate key
        const keyResult = this.validateEnvVarKey(envVar.key);
        if (!keyResult.isValid) {
          errors.push(`Invalid environment variable key: ${keyResult.error}`);
          continue;
        }

        // Validate value if provided
        if (envVar.value) {
          const valueResult = this.validateEnvVarValue(
            envVar.value,
            envVar.sensitive
          );
          if (!valueResult.isValid) {
            errors.push(
              `Invalid value for ${envVar.key}: ${valueResult.error}`
            );
            continue;
          }

          sanitized.environmentVariables.push({
            ...envVar,
            key: keyResult.sanitized,
            value: valueResult.sanitized,
          });
        } else if (envVar.required) {
          errors.push(`Required environment variable ${envVar.key} is missing`);
        } else {
          sanitized.environmentVariables.push({
            ...envVar,
            key: keyResult.sanitized,
          });
        }
      }
    }

    // Validate services array
    if (config.services) {
      if (!Array.isArray(config.services)) {
        errors.push('Services must be an array');
      } else {
        sanitized.services = config.services;
      }
    } else {
      sanitized.services = [];
    }

    // Validate team ID if provided
    if (config.teamId) {
      const teamIdResult = this.validateTeamId(config.teamId);
      if (!teamIdResult.isValid) {
        errors.push(teamIdResult.error!);
      } else {
        sanitized.teamId = teamIdResult.sanitized;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined,
    };
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): ValidationResult {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        error: 'URL is required',
      };
    }

    try {
      const parsed = new URL(url);

      // Check for valid protocol
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return {
          isValid: false,
          error: 'URL must use http:// or https:// protocol',
        };
      }

      // Check for valid hostname
      if (!parsed.hostname) {
        return {
          isValid: false,
          error: 'URL must include a valid hostname',
        };
      }

      return {
        isValid: true,
        sanitized: url.trim(),
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid URL format',
      };
    }
  }

  /**
   * Check for SQL injection patterns
   */
  containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
      /(--|;|\/\*|\*\/)/,
      /(\bOR\b.*=.*)/i,
      /(\bAND\b.*=.*)/i,
      /('|")\s*(OR|AND)\s*('|")/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Check for XSS patterns
   */
  containsXss(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Check for command injection patterns
   */
  containsCommandInjection(input: string): boolean {
    const commandPatterns = [
      /[;&|`$()]/,
      /\$\{.*\}/,
      /\$\(.*\)/,
    ];

    return commandPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Comprehensive security check
   */
  checkSecurity(input: string): ValidationResult {
    if (this.containsSqlInjection(input)) {
      return {
        isValid: false,
        error: 'Input contains potentially malicious SQL patterns',
      };
    }

    if (this.containsXss(input)) {
      return {
        isValid: false,
        error: 'Input contains potentially malicious script patterns',
      };
    }

    if (this.containsCommandInjection(input)) {
      return {
        isValid: false,
        error: 'Input contains potentially malicious command patterns',
      };
    }

    return {
      isValid: true,
      sanitized: this.sanitizeString(input),
    };
  }
}

// Singleton instance
let validator: InputValidator | null = null;

export function getInputValidator(): InputValidator {
  if (!validator) {
    validator = new InputValidator();
  }
  return validator;
}
