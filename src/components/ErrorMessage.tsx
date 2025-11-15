'use client';

import { AlertCircle, ExternalLink, RefreshCw, HelpCircle } from 'lucide-react';

interface ErrorMessageProps {
  title: string;
  message: string;
  suggestions?: string[];
  documentationLink?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title,
  message,
  suggestions = [],
  documentationLink,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      className={`bg-red-50 border-2 border-red-200 rounded-lg p-4 md:p-6 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
          <p className="text-sm text-red-800 mb-4">{message}</p>

          {suggestions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                <HelpCircle size={16} />
                How to fix this:
              </h4>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                    <span className="text-red-600 font-bold shrink-0">•</span>
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            )}
            {documentationLink && (
              <a
                href={documentationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
              >
                View Documentation
                <ExternalLink size={16} />
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
};
