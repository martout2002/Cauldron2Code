'use client';

import { AlertCircle, ExternalLink, RefreshCw, HelpCircle, Download } from 'lucide-react';

interface ErrorMessageProps {
  title: string;
  message: string;
  suggestions?: string[];
  documentationLink?: string;
  onRetry?: () => void;
  onFallback?: () => void;
  fallbackLabel?: string;
  className?: string;
}

export function ErrorMessage({
  title,
  message,
  suggestions = [],
  documentationLink,
  onRetry,
  onFallback,
  fallbackLabel = 'Download ZIP Instead',
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      className={`bg-red-900/20 border-3 border-red-500 rounded-lg p-6 md:p-8 shadow-pixel-glow animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <AlertCircle className="text-red-400 shrink-0 mt-1" size={32} />
        <div className="flex-1 min-w-0">
          <h3 className="font-pixelify text-xl md:text-2xl font-bold text-red-400 mb-3" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)' }}>
            {title}
          </h3>
          <p className="font-pixelify text-base md:text-lg text-red-200 mb-5 leading-relaxed">
            {message}
          </p>

          {suggestions.length > 0 && (
            <div className="mb-6 bg-red-950/40 border-2 border-red-700/50 rounded-lg p-4">
              <h4 className="font-pixelify text-base font-semibold text-red-300 mb-3 flex items-center gap-2">
                <HelpCircle size={20} />
                How to fix this:
              </h4>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="font-pixelify text-sm text-red-200 flex items-start gap-3">
                    <span className="text-red-400 font-bold shrink-0 text-lg">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 font-pixelify text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
            )}
            {onFallback && (
              <button
                onClick={onFallback}
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 font-pixelify text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <Download size={20} />
                {fallbackLabel}
              </button>
            )}
            {documentationLink && (
              <a
                href={documentationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gray-800 border-2 border-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 font-pixelify text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                View Documentation
                <ExternalLink size={20} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div
      className={`flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 ${className}`}
      role="alert"
    >
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <ErrorMessage
        title="Something went wrong"
        message={error.message || 'An unexpected error occurred'}
        suggestions={[
          'Try refreshing the page',
          'Clear your browser cache and cookies',
          'If the problem persists, please contact support',
        ]}
        onRetry={resetErrorBoundary}
      />
    </div>
  );
}

// Common error messages with helpful suggestions
export const ERROR_MESSAGES = {
  GENERATION_FAILED: {
    title: 'Scaffold Generation Failed',
    message: 'We encountered an error while generating your project scaffold.',
    suggestions: [
      'Check your internet connection and try again',
      'Verify that all required fields are filled correctly',
      'Try simplifying your configuration (fewer technologies)',
      'If the issue persists, try again in a few minutes',
    ],
  },
  DOWNLOAD_FAILED: {
    title: 'Download Failed',
    message: 'Unable to download your scaffold. The file may not be ready yet.',
    suggestions: [
      'Wait a moment and try downloading again',
      'Check your internet connection',
      'Ensure your browser allows downloads from this site',
      'Try using a different browser if the problem continues',
    ],
  },
  VALIDATION_ERROR: {
    title: 'Configuration Error',
    message: 'Your configuration has errors that must be fixed before generation.',
    suggestions: [
      'Review the validation messages above',
      'Fix any highlighted configuration conflicts',
      'Ensure all required fields are filled',
      'Check that your technology selections are compatible',
    ],
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Disable any VPN or proxy that might be blocking the connection',
      'If you\'re on a corporate network, check with your IT department',
    ],
  },
  TIMEOUT_ERROR: {
    title: 'Request Timeout',
    message: 'The request took too long to complete.',
    suggestions: [
      'Try again with a simpler configuration',
      'Check your internet connection speed',
      'The server might be experiencing high load - try again in a few minutes',
    ],
  },
  INVALID_CONFIG: {
    title: 'Invalid Configuration',
    message: 'The configuration data is invalid or corrupted.',
    suggestions: [
      'Reset your configuration and start over',
      'Clear your browser cache and reload the page',
      'Ensure you\'re using a supported browser (Chrome, Firefox, Safari)',
    ],
  },
  GITHUB_AUTH_ERROR: {
    title: 'GitHub Authentication Failed',
    message: 'Your GitHub authentication has expired or is invalid.',
    suggestions: [
      'Sign in to GitHub again to refresh your authentication',
      'Check that you have granted the necessary permissions',
      'Ensure you\'re not blocking third-party cookies',
      'Alternatively, download the ZIP file and push to GitHub manually',
    ],
  },
  GITHUB_CONFLICT_ERROR: {
    title: 'Repository Name Already Exists',
    message: 'A repository with this name already exists in your GitHub account.',
    suggestions: [
      'Choose a different project name and try again',
      'Delete the existing repository if you no longer need it',
      'Add a suffix or prefix to make the name unique',
      'Alternatively, download the ZIP file and push to an existing repository',
    ],
  },
  GITHUB_RATE_LIMIT_ERROR: {
    title: 'GitHub Rate Limit Exceeded',
    message: 'You have exceeded GitHub\'s rate limit for API requests.',
    suggestions: [
      'Wait a few minutes before trying again',
      'GitHub rate limits typically reset within an hour',
      'Check your GitHub account for any unusual activity',
      'Alternatively, download the ZIP file and push to GitHub manually later',
    ],
  },
  GITHUB_FAILED: {
    title: 'GitHub Repository Creation Failed',
    message: 'We encountered an error while creating your GitHub repository.',
    suggestions: [
      'Check your internet connection and try again',
      'Verify that you have permission to create repositories',
      'Ensure your GitHub account is in good standing',
      'Alternatively, download the ZIP file and push to GitHub manually',
    ],
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'The server encountered an error while processing your request.',
    suggestions: [
      'Try again in a few minutes',
      'The server might be experiencing high load',
      'If the problem persists, please contact support',
    ],
  },
};
