import { EnvironmentVariable } from './environment-detector';

/**
 * Validation result for an environment variable
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates environment variables based on their configuration
 */
export class EnvironmentVariableValidator {
  /**
   * Validate a single environment variable value
   */
  validate(envVar: EnvironmentVariable, value: string): ValidationResult {
    // Check if required field is empty
    if (envVar.required && !value.trim()) {
      return {
        isValid: false,
        error: `${envVar.key} is required`,
      };
    }

    // If value is empty and not required, it's valid
    if (!value.trim()) {
      return { isValid: true };
    }

    // Pattern validation
    if (envVar.validation?.pattern) {
      const result = this.validatePattern(value, envVar.validation.pattern);
      if (!result.isValid) {
        return result;
      }
    }

    // Length validation
    if (envVar.validation?.minLength || envVar.validation?.maxLength) {
      const result = this.validateLength(
        value,
        envVar.validation.minLength,
        envVar.validation.maxLength
      );
      if (!result.isValid) {
        return result;
      }
    }

    // Format-specific validation
    const formatResult = this.validateFormat(envVar.key, value);
    if (!formatResult.isValid) {
      return formatResult;
    }

    return { isValid: true };
  }

  /**
   * Validate all environment variables
   */
  validateAll(
    envVars: EnvironmentVariable[]
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const envVar of envVars) {
      results[envVar.key] = this.validate(envVar, envVar.value);
    }

    return results;
  }

  /**
   * Check if all required environment variables are valid
   */
  areAllValid(envVars: EnvironmentVariable[]): boolean {
    const results = this.validateAll(envVars);
    return Object.values(results).every((result) => result.isValid);
  }

  /**
   * Get all validation errors
   */
  getErrors(envVars: EnvironmentVariable[]): Record<string, string> {
    const results = this.validateAll(envVars);
    const errors: Record<string, string> = {};

    for (const [key, result] of Object.entries(results)) {
      if (!result.isValid && result.error) {
        errors[key] = result.error;
      }
    }

    return errors;
  }

  /**
   * Validate against a regex pattern
   */
  private validatePattern(value: string, pattern: string): ValidationResult {
    try {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return {
          isValid: false,
          error: 'Value does not match the required format',
        };
      }
      return { isValid: true };
    } catch (_error) {
      // Invalid regex pattern
      return { isValid: true }; // Don't fail validation due to bad pattern
    }
  }

  /**
   * Validate string length
   */
  private validateLength(
    value: string,
    minLength?: number,
    maxLength?: number
  ): ValidationResult {
    if (minLength !== undefined && value.length < minLength) {
      return {
        isValid: false,
        error: `Value must be at least ${minLength} characters long`,
      };
    }

    if (maxLength !== undefined && value.length > maxLength) {
      return {
        isValid: false,
        error: `Value must be at most ${maxLength} characters long`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate specific formats based on environment variable key
   */
  private validateFormat(key: string, value: string): ValidationResult {
    // URL validation
    if (this.isUrlKey(key)) {
      return this.validateUrl(value);
    }

    // API key validation
    if (this.isApiKeyKey(key)) {
      return this.validateApiKey(value);
    }

    // Database URL validation
    if (this.isDatabaseUrlKey(key)) {
      return this.validateDatabaseUrl(value);
    }

    // JWT/Token validation
    if (this.isJwtKey(key)) {
      return this.validateJwt(value);
    }

    return { isValid: true };
  }

  /**
   * Check if key represents a URL
   */
  private isUrlKey(key: string): boolean {
    const urlKeys = [
      'URL',
      'NEXTAUTH_URL',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'CALLBACK_URL',
      'REDIRECT_URL',
    ];
    return urlKeys.some((urlKey) => key.includes(urlKey));
  }

  /**
   * Check if key represents an API key
   */
  private isApiKeyKey(key: string): boolean {
    const apiKeyKeys = [
      'API_KEY',
      'ANTHROPIC_API_KEY',
      'OPENAI_API_KEY',
      'GOOGLE_AI_API_KEY',
      'SECRET_KEY',
      'CLERK_SECRET_KEY',
    ];
    return apiKeyKeys.some((apiKey) => key.includes(apiKey));
  }

  /**
   * Check if key represents a database URL
   */
  private isDatabaseUrlKey(key: string): boolean {
    return key === 'DATABASE_URL' || key === 'MONGODB_URI' || key === 'REDIS_URL';
  }

  /**
   * Check if key represents a JWT or token
   */
  private isJwtKey(key: string): boolean {
    return (
      key.includes('ANON_KEY') ||
      key.includes('SERVICE_ROLE_KEY') ||
      key === 'NEXTAUTH_SECRET'
    );
  }

  /**
   * Validate URL format
   */
  private validateUrl(value: string): ValidationResult {
    try {
      const url = new URL(value);
      
      // Check for valid protocol
      if (!['http:', 'https:'].includes(url.protocol)) {
        return {
          isValid: false,
          error: 'URL must use http:// or https:// protocol',
        };
      }

      // Check for valid hostname
      if (!url.hostname) {
        return {
          isValid: false,
          error: 'URL must include a valid hostname',
        };
      }

      return { isValid: true };
    } catch (_error) {
      return {
        isValid: false,
        error: 'Invalid URL format',
      };
    }
  }

  /**
   * Validate API key format
   */
  private validateApiKey(value: string): ValidationResult {
    // API keys should not contain spaces
    if (value.includes(' ')) {
      return {
        isValid: false,
        error: 'API key should not contain spaces',
      };
    }

    // API keys should have minimum length
    if (value.length < 10) {
      return {
        isValid: false,
        error: 'API key appears to be too short',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate database URL format
   */
  private validateDatabaseUrl(value: string): ValidationResult {
    // PostgreSQL
    if (value.startsWith('postgresql://') || value.startsWith('postgres://')) {
      return this.validatePostgresUrl(value);
    }

    // MongoDB
    if (value.startsWith('mongodb://') || value.startsWith('mongodb+srv://')) {
      return this.validateMongoUrl(value);
    }

    // Redis
    if (value.startsWith('redis://') || value.startsWith('rediss://')) {
      return this.validateRedisUrl(value);
    }

    return {
      isValid: false,
      error: 'Database URL must start with a valid protocol (postgresql://, mongodb://, redis://)',
    };
  }

  /**
   * Validate PostgreSQL URL format
   */
  private validatePostgresUrl(value: string): ValidationResult {
    try {
      const url = new URL(value);
      
      if (!url.hostname) {
        return {
          isValid: false,
          error: 'PostgreSQL URL must include a hostname',
        };
      }

      if (!url.pathname || url.pathname === '/') {
        return {
          isValid: false,
          error: 'PostgreSQL URL must include a database name',
        };
      }

      return { isValid: true };
    } catch (_error) {
      return {
        isValid: false,
        error: 'Invalid PostgreSQL URL format',
      };
    }
  }

  /**
   * Validate MongoDB URL format
   */
  private validateMongoUrl(value: string): ValidationResult {
    try {
      const url = new URL(value);
      
      if (!url.hostname) {
        return {
          isValid: false,
          error: 'MongoDB URL must include a hostname',
        };
      }

      return { isValid: true };
    } catch (_error) {
      return {
        isValid: false,
        error: 'Invalid MongoDB URL format',
      };
    }
  }

  /**
   * Validate Redis URL format
   */
  private validateRedisUrl(value: string): ValidationResult {
    try {
      const url = new URL(value);
      
      if (!url.hostname) {
        return {
          isValid: false,
          error: 'Redis URL must include a hostname',
        };
      }

      return { isValid: true };
    } catch (_error) {
      return {
        isValid: false,
        error: 'Invalid Redis URL format',
      };
    }
  }

  /**
   * Validate JWT format (basic check)
   */
  private validateJwt(value: string): ValidationResult {
    // JWT should have three parts separated by dots
    const parts = value.split('.');
    
    if (parts.length === 3) {
      // Looks like a JWT
      return { isValid: true };
    }

    // For NEXTAUTH_SECRET, just check minimum length
    if (value.length >= 32) {
      return { isValid: true };
    }

    return {
      isValid: false,
      error: 'Value does not appear to be a valid token format',
    };
  }
}
