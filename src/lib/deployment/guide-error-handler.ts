/**
 * Guide Error Handler
 * 
 * Handles errors that occur during deployment guide generation, progress saving,
 * and export operations. Provides user-friendly error messages and fallback options.
 * 
 * Requirement 2.7: Handle guide generation errors gracefully
 */

export type GuideErrorCode =
  | 'GENERATION_FAILED'
  | 'INVALID_PLATFORM'
  | 'INVALID_CONFIG'
  | 'MISSING_PLATFORM_DATA'
  | 'PROGRESS_SAVE_FAILED'
  | 'PROGRESS_LOAD_FAILED'
  | 'EXPORT_FAILED'
  | 'INVALID_URL_PARAMS'
  | 'STORAGE_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

export interface GuideError {
  code: GuideErrorCode;
  message: string;
  userMessage: string;
  recoverable: boolean;
  suggestions: string[];
  fallbackAction?: 'retry' | 'download' | 'github' | 'selector';
}

export interface ErrorContext {
  platform?: string;
  configId?: string;
  operation?: string;
  originalError?: Error;
}

/**
 * GuideErrorHandler provides error classification and recovery strategies
 * for deployment guide operations
 */
export class GuideErrorHandler {
  /**
   * Handle guide generation errors
   * 
   * @param error - The error that occurred
   * @param context - Additional context about the error
   * @returns Structured error with user-friendly message and suggestions
   */
  handleGenerationError(error: Error, context?: ErrorContext): GuideError {
    console.error('Guide generation failed:', error, context);

    // Check for specific error patterns
    if (error.message.includes('platform') || context?.platform) {
      return this.createInvalidPlatformError(context?.platform);
    }

    if (error.message.includes('config') || error.message.includes('scaffold')) {
      return this.createInvalidConfigError();
    }

    // Generic generation error
    return {
      code: 'GENERATION_FAILED',
      message: error.message || 'Failed to generate deployment guide',
      userMessage: 'We encountered an issue generating your deployment guide.',
      recoverable: true,
      suggestions: [
        'Try selecting a different platform',
        'Verify your scaffold configuration is complete',
        'Refresh the page and try again',
        'Generate a new scaffold if the issue persists',
      ],
      fallbackAction: 'selector',
    };
  }

  /**
   * Handle progress save errors
   * 
   * These errors should not block the user - progress tracking is a convenience feature.
   * Log the error but allow the user to continue using the guide.
   * 
   * @param error - The error that occurred
   * @param context - Additional context
   * @returns Structured error (non-blocking)
   */
  handleProgressSaveError(error: Error, context?: ErrorContext): GuideError {
    console.warn('Failed to save guide progress:', error, context);

    // Check if localStorage is available
    if (this.isStorageUnavailable(error)) {
      return {
        code: 'STORAGE_UNAVAILABLE',
        message: 'Browser storage is not available',
        userMessage: 'Your progress cannot be saved in this browser session.',
        recoverable: false,
        suggestions: [
          'Your progress will not be saved between sessions',
          'Consider exporting the guide as Markdown for reference',
          'Check if your browser has disabled local storage',
          'Try using a different browser if needed',
        ],
      };
    }

    return {
      code: 'PROGRESS_SAVE_FAILED',
      message: error.message || 'Failed to save progress',
      userMessage: 'Unable to save your progress automatically.',
      recoverable: true,
      suggestions: [
        'Your progress may not persist if you refresh the page',
        'Export the guide as Markdown to save your place',
        'Continue using the guide - we\'ll try to save again',
      ],
    };
  }

  /**
   * Handle progress load errors
   * 
   * @param error - The error that occurred
   * @param context - Additional context
   * @returns Structured error
   */
  handleProgressLoadError(error: Error, context?: ErrorContext): GuideError {
    console.warn('Failed to load guide progress:', error, context);

    return {
      code: 'PROGRESS_LOAD_FAILED',
      message: error.message || 'Failed to load saved progress',
      userMessage: 'We couldn\'t restore your previous progress.',
      recoverable: true,
      suggestions: [
        'Starting fresh - you can mark steps as complete as you go',
        'Your previous progress may have been cleared',
        'This won\'t affect your ability to follow the guide',
      ],
    };
  }

  /**
   * Handle export errors
   * 
   * @param error - The error that occurred
   * @param exportType - Type of export that failed (markdown, print)
   * @returns Structured error with alternative export options
   */
  handleExportError(error: Error, exportType: 'markdown' | 'print'): GuideError {
    console.error(`Failed to export guide as ${exportType}:`, error);

    const isMarkdownExport = exportType === 'markdown';

    return {
      code: 'EXPORT_FAILED',
      message: error.message || `Failed to export as ${exportType}`,
      userMessage: `Unable to export the guide as ${isMarkdownExport ? 'Markdown' : 'PDF'}.`,
      recoverable: true,
      suggestions: isMarkdownExport
        ? [
            'Try the print option instead',
            'Copy and paste the guide content manually',
            'Take screenshots of important steps',
            'Bookmark this page for future reference',
          ]
        : [
            'Try the Markdown export instead',
            'Use your browser\'s built-in print function (Ctrl/Cmd + P)',
            'Take screenshots of the guide',
            'Bookmark this page for future reference',
          ],
      fallbackAction: 'retry',
    };
  }

  /**
   * Handle invalid platform errors
   * 
   * @param platformId - The invalid platform ID
   * @returns Structured error
   */
  private createInvalidPlatformError(platformId?: string): GuideError {
    return {
      code: 'INVALID_PLATFORM',
      message: `Invalid platform: ${platformId || 'unknown'}`,
      userMessage: platformId
        ? `The platform "${platformId}" is not supported.`
        : 'The selected platform is not valid.',
      recoverable: true,
      suggestions: [
        'Choose from: Vercel, Railway, Render, Netlify, or AWS Amplify',
        'Return to the platform selector to choose a valid platform',
        'Check if the URL was typed correctly',
      ],
      fallbackAction: 'selector',
    };
  }

  /**
   * Handle invalid configuration errors
   * 
   * @returns Structured error
   */
  private createInvalidConfigError(): GuideError {
    return {
      code: 'INVALID_CONFIG',
      message: 'Invalid or missing scaffold configuration',
      userMessage: 'Your scaffold configuration could not be found or is incomplete.',
      recoverable: true,
      suggestions: [
        'Generate a new scaffold from the configuration wizard',
        'Ensure you completed all required configuration steps',
        'Try generating the guide again after creating a scaffold',
      ],
      fallbackAction: 'download',
    };
  }

  /**
   * Handle missing platform data errors
   * 
   * @param platformId - The platform with missing data
   * @returns Structured error
   */
  createMissingPlatformDataError(platformId: string): GuideError {
    return {
      code: 'MISSING_PLATFORM_DATA',
      message: `Missing data for platform: ${platformId}`,
      userMessage: `Some information for ${platformId} is currently unavailable.`,
      recoverable: true,
      suggestions: [
        'The guide may be incomplete but should still be usable',
        'Check the platform\'s official documentation for missing details',
        'Try a different platform if this one has issues',
      ],
      fallbackAction: 'selector',
    };
  }

  /**
   * Handle invalid URL parameter errors
   * 
   * @param paramName - The invalid parameter name
   * @param paramValue - The invalid parameter value
   * @returns Structured error
   */
  handleInvalidUrlParams(paramName: string, paramValue?: string): GuideError {
    return {
      code: 'INVALID_URL_PARAMS',
      message: `Invalid URL parameter: ${paramName}=${paramValue || 'undefined'}`,
      userMessage: 'The guide URL is invalid or incomplete.',
      recoverable: true,
      suggestions: [
        'Return to the platform selector to generate a new guide',
        'Check if the URL was copied correctly',
        'Generate a new scaffold and deployment guide',
      ],
      fallbackAction: 'selector',
    };
  }

  /**
   * Create a generic unknown error
   * 
   * @param error - The original error
   * @param context - Additional context
   * @returns Structured error
   */
  handleUnknownError(error: Error, context?: ErrorContext): GuideError {
    console.error('Unknown error in deployment guides:', error, context);

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      userMessage: 'Something unexpected happened.',
      recoverable: true,
      suggestions: [
        'Try refreshing the page',
        'Return to the platform selector and try again',
        'Generate a new scaffold if the issue persists',
        'Contact support if the problem continues',
      ],
      fallbackAction: 'selector',
    };
  }

  /**
   * Check if error is due to storage being unavailable
   * 
   * @param error - The error to check
   * @returns True if storage is unavailable
   */
  private isStorageUnavailable(error: Error): boolean {
    return (
      error.message.includes('localStorage') ||
      error.message.includes('storage') ||
      error.message.includes('QuotaExceededError') ||
      error.name === 'QuotaExceededError'
    );
  }

  /**
   * Get user-friendly error message for display
   * 
   * @param error - The guide error
   * @returns Formatted error message
   */
  getUserMessage(error: GuideError): string {
    return error.userMessage;
  }

  /**
   * Get suggestions for error recovery
   * 
   * @param error - The guide error
   * @returns Array of suggestion strings
   */
  getSuggestions(error: GuideError): string[] {
    return error.suggestions;
  }

  /**
   * Get fallback action for error
   * 
   * @param error - The guide error
   * @returns Fallback action or undefined
   */
  getFallbackAction(error: GuideError): GuideError['fallbackAction'] {
    return error.fallbackAction;
  }

  /**
   * Check if error is recoverable
   * 
   * @param error - The guide error
   * @returns True if user can recover from this error
   */
  isRecoverable(error: GuideError): boolean {
    return error.recoverable;
  }

  /**
   * Log error for debugging (can be extended to send to error tracking service)
   * 
   * @param error - The guide error
   * @param context - Additional context
   */
  logError(error: GuideError, context?: ErrorContext): void {
    const logData = {
      code: error.code,
      message: error.message,
      recoverable: error.recoverable,
      context,
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[GuideErrorHandler]', logData);
    }

    // In production, this could send to an error tracking service like Sentry
    // Example: Sentry.captureException(error, { extra: logData });
  }
}

/**
 * Singleton instance
 */
let errorHandlerInstance: GuideErrorHandler | null = null;

/**
 * Get the singleton GuideErrorHandler instance
 */
export function getGuideErrorHandler(): GuideErrorHandler {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new GuideErrorHandler();
  }
  return errorHandlerInstance;
}
