/**
 * Deployment Error Handler
 * Handles deployment errors with classification, recovery strategies, and fallback options
 */

import type { DeploymentError, Deployment, PlatformType } from '@/lib/platforms/types';

export interface RecoveryAction {
  type: 'reconnect' | 'retry' | 'manual' | 'alternative' | 'check' | 'fallback';
  message: string;
  action?: () => Promise<void>;
  suggestions?: string[];
  alternatives?: PlatformType[];
  fallback?: 'github' | 'download';
  fallbackMessage?: string;
}

/**
 * DeploymentErrorHandler provides error classification and recovery strategies
 * for various deployment failure scenarios
 */
export class DeploymentErrorHandler {
  /**
   * Handle a deployment error and return appropriate recovery action
   * @param error - The deployment error
   * @param deployment - The deployment that failed
   * @returns Recovery action with suggestions
   */
  async handleError(
    error: DeploymentError,
    deployment: Deployment
  ): Promise<RecoveryAction> {
    switch (error.code) {
      case 'AUTH_FAILED':
        return this.handleAuthError(deployment.platform);

      case 'PROJECT_NAME_TAKEN':
        return this.handleNameConflict(deployment.projectName);

      case 'BUILD_FAILED':
        return this.handleBuildFailure(error);

      case 'PLATFORM_UNAVAILABLE':
        return this.handlePlatformOutage(deployment.platform);

      case 'TIMEOUT':
        return this.handleTimeout(deployment);

      case 'UPLOAD_FAILED':
        return this.handleUploadFailure(error);

      case 'RATE_LIMIT_EXCEEDED':
        return this.handleRateLimit(error);

      case 'INVALID_CONFIG':
        return this.handleInvalidConfig(error);

      case 'INSUFFICIENT_PERMISSIONS':
        return this.handlePermissionError(deployment.platform);

      default:
        return this.handleUnknownError(error);
    }
  }

  /**
   * Handle authentication failures
   */
  private handleAuthError(platform: PlatformType): RecoveryAction {
    return {
      type: 'reconnect',
      message: `Authentication with ${platform} failed. Please reconnect your account.`,
      suggestions: [
        'Your access token may have expired',
        'Try disconnecting and reconnecting your account',
        'Check if you have the necessary permissions',
      ],
    };
  }

  /**
   * Handle project name conflicts
   */
  private handleNameConflict(projectName: string): RecoveryAction {
    return {
      type: 'retry',
      message: 'Project name is already taken. Try a different name.',
      suggestions: this.generateNameSuggestions(projectName),
    };
  }

  /**
   * Handle build failures
   */
  private handleBuildFailure(error: DeploymentError): RecoveryAction {
    const suggestions = [
      'Review the build logs for specific errors',
      'Verify all environment variables are correct',
      'Check that your dependencies are compatible',
      'Ensure build commands are properly configured',
    ];

    // Add specific suggestions based on error message
    if (error.message.includes('MODULE_NOT_FOUND')) {
      suggestions.unshift('Missing dependency - check your package.json');
    } else if (error.message.includes('ENOENT')) {
      suggestions.unshift('File not found - verify file paths in your build config');
    } else if (error.message.includes('syntax error')) {
      suggestions.unshift('Syntax error in your code - check the error location');
    }

    return {
      type: 'manual',
      message: 'Build failed. Review logs and try again, or deploy manually.',
      suggestions,
      fallback: 'github',
      fallbackMessage: 'Create GitHub repository for manual debugging and deployment',
    };
  }

  /**
   * Handle platform outages
   */
  private handlePlatformOutage(platform: PlatformType): RecoveryAction {
    return {
      type: 'alternative',
      message: `${platform} is currently unavailable. Try a different platform or wait.`,
      alternatives: this.getAlternativePlatforms(platform),
      suggestions: [
        `Check ${platform} status page for updates`,
        'Try again in a few minutes',
        'Use an alternative platform',
        'Download ZIP as a backup',
      ],
    };
  }

  /**
   * Handle deployment timeouts
   */
  private handleTimeout(_deployment: Deployment): RecoveryAction {
    return {
      type: 'check',
      message: 'Deployment timed out after 5 minutes. It may still be in progress.',
      suggestions: [
        `Check deployment status on ${_deployment.platform} dashboard`,
        'The deployment may complete successfully',
        'If it fails, you can retry the deployment',
      ],
    };
  }

  /**
   * Handle file upload failures
   */
  private handleUploadFailure(_error: DeploymentError): RecoveryAction {
    return {
      type: 'retry',
      message: 'Failed to upload files. This is usually a temporary network issue.',
      suggestions: [
        'Check your internet connection',
        'Try the deployment again',
        'If the issue persists, try a different platform',
      ],
      fallback: 'github',
      fallbackMessage: 'Create GitHub repository as an alternative',
    };
  }

  /**
   * Handle rate limit errors
   */
  private handleRateLimit(error: DeploymentError): RecoveryAction {
    const resetTime = error.platformError?.resetTime || 'soon';
    return {
      type: 'check',
      message: 'Deployment rate limit exceeded. Please wait before trying again.',
      suggestions: [
        `Rate limit will reset ${resetTime}`,
        'You can download the ZIP file in the meantime',
        'Or create a GitHub repository for later deployment',
      ],
      fallback: 'download',
      fallbackMessage: 'Download ZIP to deploy later',
    };
  }

  /**
   * Handle invalid configuration errors
   */
  private handleInvalidConfig(error: DeploymentError): RecoveryAction {
    return {
      type: 'retry',
      message: 'Invalid deployment configuration. Please check your settings.',
      suggestions: [
        'Verify all required environment variables are provided',
        'Check that project name follows platform requirements',
        'Ensure build and start commands are correct',
        error.message, // Include specific error message
      ],
    };
  }

  /**
   * Handle permission errors
   */
  private handlePermissionError(platform: PlatformType): RecoveryAction {
    return {
      type: 'reconnect',
      message: `Insufficient permissions for ${platform}. Reconnect with required permissions.`,
      suggestions: [
        'Ensure you grant all required permissions during OAuth',
        'Check if you have access to the team/organization',
        'Try reconnecting your account',
      ],
    };
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: DeploymentError): RecoveryAction {
    return {
      type: 'fallback',
      message: 'An unexpected error occurred during deployment.',
      suggestions: [
        error.message || 'Unknown error',
        'Try deploying again',
        'If the issue persists, use manual deployment',
      ],
      fallback: 'download',
      fallbackMessage: 'Download ZIP and deploy manually',
    };
  }

  /**
   * Generate alternative project name suggestions
   */
  private generateNameSuggestions(name: string): string[] {
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    
    const suggestions = [
      `${name}-${timestamp}`,
      `${name}-${randomSuffix}`,
      `${name}-v2`,
      `${name}-app`,
      `my-${name}`,
      `${name}-prod`,
    ];

    // Remove duplicates and the original name
    return [...new Set(suggestions)].filter((s) => s !== name).slice(0, 4);
  }

  /**
   * Generate name suggestions publicly accessible
   */
  generateProjectNameSuggestions(name: string): string[] {
    return this.generateNameSuggestions(name);
  }

  /**
   * Get alternative platforms to try
   */
  private getAlternativePlatforms(current: PlatformType): PlatformType[] {
    const allPlatforms: PlatformType[] = ['vercel', 'railway', 'render'];
    return allPlatforms.filter((p) => p !== current);
  }

  /**
   * Classify error severity
   */
  classifyError(error: DeploymentError): 'critical' | 'recoverable' | 'temporary' {
    const criticalCodes = ['INVALID_CONFIG', 'INSUFFICIENT_PERMISSIONS'];
    const temporaryCodes = ['TIMEOUT', 'UPLOAD_FAILED', 'PLATFORM_UNAVAILABLE', 'RATE_LIMIT_EXCEEDED'];

    if (criticalCodes.includes(error.code)) {
      return 'critical';
    }

    if (temporaryCodes.includes(error.code)) {
      return 'temporary';
    }

    return 'recoverable';
  }

  /**
   * Generate user-friendly error message
   */
  generateUserMessage(error: DeploymentError, deployment: Deployment): string {
    const platform = deployment.platform.charAt(0).toUpperCase() + deployment.platform.slice(1);
    const step = this.getStepName(error.step);

    let message = `Deployment to ${platform} failed during ${step}.`;

    if (error.recoverable) {
      message += ' You can try again or use an alternative deployment method.';
    } else {
      message += ' Please use manual deployment.';
    }

    return message;
  }

  /**
   * Get human-readable step name
   */
  private getStepName(step: DeploymentError['step']): string {
    const stepNames: Record<DeploymentError['step'], string> = {
      auth: 'authentication',
      create: 'project creation',
      upload: 'file upload',
      configure: 'configuration',
      build: 'build process',
      deploy: 'deployment',
    };

    return stepNames[step] || step;
  }

  /**
   * Create a deployment error from a generic error
   */
  static createError(
    error: any,
    step: DeploymentError['step'],
    context?: Partial<DeploymentError>
  ): DeploymentError {
    // Check for specific error patterns
    if (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
      return {
        code: 'PLATFORM_UNAVAILABLE',
        message: 'Unable to connect to platform API',
        step,
        platformError: error,
        recoverable: true,
        suggestions: ['Check platform status', 'Try again later', 'Use a different platform'],
      };
    }

    if (error.status === 401 || error.statusCode === 401) {
      return {
        code: 'AUTH_FAILED',
        message: 'Authentication failed',
        step,
        platformError: error,
        recoverable: true,
        suggestions: ['Reconnect your platform account', 'Check if your token expired'],
      };
    }

    if (error.status === 403 || error.statusCode === 403) {
      return {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions',
        step,
        platformError: error,
        recoverable: true,
        suggestions: ['Check your account permissions', 'Reconnect with required scopes'],
      };
    }

    if (error.status === 409 || error.statusCode === 409 || error.message?.includes('already exists')) {
      return {
        code: 'PROJECT_NAME_TAKEN',
        message: 'Project name is already taken',
        step,
        platformError: error,
        recoverable: true,
        suggestions: ['Try a different project name'],
      };
    }

    if (error.status === 429 || error.statusCode === 429) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded',
        step,
        platformError: error,
        recoverable: true,
        suggestions: ['Wait before trying again', 'Check rate limit reset time'],
      };
    }

    // Default unknown error
    return {
      code: context?.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      step,
      platformError: error,
      recoverable: context?.recoverable ?? false,
      suggestions: context?.suggestions || ['Try again', 'Contact support if issue persists'],
    };
  }
}

// Singleton instance
let errorHandlerInstance: DeploymentErrorHandler | null = null;

/**
 * Get the singleton DeploymentErrorHandler instance
 */
export function getDeploymentErrorHandler(): DeploymentErrorHandler {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new DeploymentErrorHandler();
  }
  return errorHandlerInstance;
}
