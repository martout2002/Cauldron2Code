'use client';

import { useState } from 'react';
import { XCircle, AlertTriangle, RefreshCw, ExternalLink, Download, Github } from 'lucide-react';
import type { DeploymentError, PlatformType } from '@/lib/platforms/types';

interface DeploymentErrorCardProps {
  error: DeploymentError;
  platform: PlatformType;
  projectName?: string;
  onRetry?: () => void;
  onReconnect?: () => void;
  onDownloadZip?: () => void;
  onCreateGitHub?: () => void;
  className?: string;
}

export function DeploymentErrorCard({
  error,
  platform,
  onRetry,
  onReconnect,
  onDownloadZip,
  onCreateGitHub,
  className = '',
}: DeploymentErrorCardProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = () => {
    if (error.code === 'TIMEOUT' || error.code === 'PLATFORM_UNAVAILABLE') {
      return <AlertTriangle size={24} className="text-yellow-600" />;
    }
    return <XCircle size={24} className="text-red-600" />;
  };

  const getErrorTitle = () => {
    switch (error.code) {
      case 'AUTH_FAILED':
        return 'Authentication Failed';
      case 'PROJECT_NAME_TAKEN':
        return 'Project Name Unavailable';
      case 'BUILD_FAILED':
        return 'Build Failed';
      case 'PLATFORM_UNAVAILABLE':
        return 'Platform Unavailable';
      case 'TIMEOUT':
        return 'Deployment Timeout';
      case 'UPLOAD_FAILED':
        return 'Upload Failed';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Rate Limit Exceeded';
      case 'INSUFFICIENT_PERMISSIONS':
        return 'Insufficient Permissions';
      default:
        return 'Deployment Failed';
    }
  };

  const getPlatformStatusUrl = (platform: PlatformType): string => {
    const statusUrls: Record<PlatformType, string> = {
      vercel: 'https://www.vercel-status.com/',
      railway: 'https://status.railway.app/',
      render: 'https://status.render.com/',
    };
    return statusUrls[platform];
  };

  const getPlatformDashboardUrl = (platform: PlatformType): string => {
    const dashboardUrls: Record<PlatformType, string> = {
      vercel: 'https://vercel.com/dashboard',
      railway: 'https://railway.app/dashboard',
      render: 'https://dashboard.render.com/',
    };
    return dashboardUrls[platform];
  };

  const getManualConnectionInstructions = () => {
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    
    return (
      <div className="space-y-3 text-sm">
        <p className="font-medium text-gray-900">Manual Connection Steps:</p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>
            Go to your{' '}
            <a
              href={getPlatformDashboardUrl(platform)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              {platformName} Dashboard
              <ExternalLink size={12} />
            </a>
          </li>
          <li>Navigate to Settings → Integrations or API Tokens</li>
          <li>Create a new API token or OAuth application</li>
          <li>Grant the necessary permissions for deployments</li>
          <li>Return here and click "Reconnect Account" to try again</li>
        </ol>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            <strong>Required Permissions:</strong> Project creation, file uploads, environment
            variable management, and deployment triggering.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border-2 border-red-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-red-100 bg-red-50">
        <div className="flex items-start gap-3">
          {getErrorIcon()}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{getErrorTitle()}</h3>
            <p className="text-sm text-gray-700 mt-1">{error.message}</p>
          </div>
        </div>
      </div>

      {/* Error Details */}
      <div className="p-4 space-y-4">
        {/* Suggestions */}
        {error.suggestions && error.suggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">What to try:</p>
            <ul className="space-y-1.5">
              {error.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Authentication-specific help */}
        {error.code === 'AUTH_FAILED' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowManualInstructions(!showManualInstructions)}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              {showManualInstructions ? 'Hide' : 'Show'} Manual Connection Instructions
            </button>
            
            {showManualInstructions && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                {getManualConnectionInstructions()}
              </div>
            )}
          </div>
        )}

        {/* Platform status link for outages */}
        {error.code === 'PLATFORM_UNAVAILABLE' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 mb-2">
              The platform may be experiencing issues. Check their status page:
            </p>
            <a
              href={getPlatformStatusUrl(platform)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              View {platform.charAt(0).toUpperCase() + platform.slice(1)} Status
              <ExternalLink size={14} />
            </a>
          </div>
        )}

        {/* Timeout-specific help */}
        {error.code === 'TIMEOUT' && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900 font-medium mb-2">
                ⏱️ Deployment Timeout
              </p>
              <p className="text-sm text-blue-800 mb-3">
                The deployment exceeded the 5-minute timeout limit. However, this doesn't
                necessarily mean it failed - the deployment may still be in progress on the
                platform.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-blue-800 font-medium">What to do next:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Check the platform dashboard to see the actual deployment status</li>
                  <li>If it's still building, wait for it to complete</li>
                  <li>If it failed, review the build logs on the platform</li>
                  <li>If it succeeded, you'll find your deployment URL there</li>
                </ol>
              </div>
            </div>
            
            <a
              href={getPlatformDashboardUrl(platform)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Open {platform.charAt(0).toUpperCase() + platform.slice(1)} Dashboard
              <ExternalLink size={16} />
            </a>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-xs text-gray-700">
                <strong>Note:</strong> Large projects or complex builds may take longer than
                5 minutes. If this happens frequently, consider optimizing your build process
                or splitting your project into smaller services.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {/* Reconnect button for auth errors */}
          {error.code === 'AUTH_FAILED' && onReconnect && (
            <button
              onClick={onReconnect}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Reconnect Account
            </button>
          )}

          {/* Retry button for recoverable errors */}
          {error.recoverable && onRetry && error.code !== 'AUTH_FAILED' && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Retry Deployment
                </>
              )}
            </button>
          )}

          {/* GitHub fallback */}
          {onCreateGitHub && (error.code === 'BUILD_FAILED' || error.code === 'UPLOAD_FAILED') && (
            <button
              onClick={onCreateGitHub}
              className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-900 transition-colors inline-flex items-center gap-2"
            >
              <Github size={16} />
              Create GitHub Repo
            </button>
          )}

          {/* Download ZIP fallback */}
          {onDownloadZip && (
            <button
              onClick={onDownloadZip}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
            >
              <Download size={16} />
              Download ZIP
            </button>
          )}
        </div>

        {/* Error code for debugging */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Error Code: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{error.code}</code>
            {' • '}
            Failed at: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{error.step}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
