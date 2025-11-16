'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, ExternalLink, Info, Shield, Lock } from 'lucide-react';
import { Tooltip } from './Tooltip';
import type { PlatformType } from '@/lib/platforms/types';

interface PlatformStatus {
  platform: PlatformType;
  connected: boolean;
  accountName?: string;
  accountId?: string;
  isLoading: boolean;
  error?: string;
}

interface PlatformConnectorProps {
  onConnectionChange?: (platform: PlatformType, connected: boolean) => void;
  className?: string;
}

const PLATFORM_INFO: Record<
  PlatformType,
  { name: string; description: string; icon: string }
> = {
  vercel: {
    name: 'Vercel',
    description: 'Deploy frontend and full-stack applications',
    icon: '▲',
  },
  railway: {
    name: 'Railway',
    description: 'Deploy backend services with databases',
    icon: '🚂',
  },
  render: {
    name: 'Render',
    description: 'Deploy web services and databases',
    icon: '🎨',
  },
};

export function PlatformConnector({
  onConnectionChange,
  className = '',
}: PlatformConnectorProps) {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([
    { platform: 'vercel', connected: false, isLoading: true },
    { platform: 'railway', connected: false, isLoading: true },
    { platform: 'render', connected: false, isLoading: true },
  ]);

  useEffect(() => {
    checkAllPlatformStatus();
  }, []);

  const checkAllPlatformStatus = async () => {
    const platformTypes: PlatformType[] = ['vercel', 'railway', 'render'];

    for (const platform of platformTypes) {
      await checkPlatformStatus(platform);
    }
  };

  const checkPlatformStatus = async (platform: PlatformType) => {
    try {
      const response = await fetch(`/api/platforms/${platform}/auth/status`);
      const data = await response.json();

      setPlatforms((prev) =>
        prev.map((p) =>
          p.platform === platform
            ? {
                ...p,
                connected: data.authenticated,
                accountName: data.accountName,
                accountId: data.accountId,
                isLoading: false,
                error: undefined,
              }
            : p
        )
      );

      if (onConnectionChange) {
        onConnectionChange(platform, data.authenticated);
      }
    } catch (error) {
      console.error(`Failed to check ${platform} status:`, error);
      setPlatforms((prev) =>
        prev.map((p) =>
          p.platform === platform
            ? {
                ...p,
                isLoading: false,
                error: 'Failed to check connection status',
              }
            : p
        )
      );
    }
  };

  const handleConnect = async (platform: PlatformType) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.platform === platform ? { ...p, isLoading: true, error: undefined } : p
      )
    );

    try {
      const response = await fetch(`/api/platforms/${platform}/auth/initiate`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate authentication');
      }

      // Redirect to OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error(`Failed to connect to ${platform}:`, error);
      setPlatforms((prev) =>
        prev.map((p) =>
          p.platform === platform
            ? {
                ...p,
                isLoading: false,
                error:
                  error instanceof Error
                    ? error.message
                    : 'Failed to start authentication',
              }
            : p
        )
      );
    }
  };

  const handleDisconnect = async (platform: PlatformType) => {
    if (
      !confirm(
        `Are you sure you want to disconnect from ${PLATFORM_INFO[platform].name}?`
      )
    ) {
      return;
    }

    setPlatforms((prev) =>
      prev.map((p) =>
        p.platform === platform ? { ...p, isLoading: true, error: undefined } : p
      )
    );

    try {
      const response = await fetch(
        `/api/platforms/${platform}/auth/disconnect`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setPlatforms((prev) =>
        prev.map((p) =>
          p.platform === platform
            ? {
                ...p,
                connected: false,
                accountName: undefined,
                accountId: undefined,
                isLoading: false,
                error: undefined,
              }
            : p
        )
      );

      if (onConnectionChange) {
        onConnectionChange(platform, false);
      }
    } catch (error) {
      console.error(`Failed to disconnect from ${platform}:`, error);
      setPlatforms((prev) =>
        prev.map((p) =>
          p.platform === platform
            ? {
                ...p,
                isLoading: false,
                error: 'Failed to disconnect. Please try again.',
              }
            : p
        )
      );
    }
  };

  return (
    <div className={`space-y-4 animate-in fade-in duration-500 ${className}`}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Connect Deployment Platforms
          </h3>
          <Tooltip content="Connect your hosting platform accounts to enable one-click deployment. Cauldron2Code will securely authenticate and deploy your projects.">
            <Info size={16} className="text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        <p className="text-sm text-gray-600">
          Connect your accounts to deploy directly from Cauldron2Code
        </p>
      </div>

      <div className="space-y-3">
        {platforms.map((platformStatus) => {
          const info = PLATFORM_INFO[platformStatus.platform];

          return (
            <div
              key={platformStatus.platform}
              className={`p-4 border rounded-lg transition-all duration-300 ${
                platformStatus.connected
                  ? 'bg-green-50 border-green-200 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Platform Icon */}
                <div className="text-2xl shrink-0 mt-0.5">{info.icon}</div>

                {/* Platform Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{info.name}</h4>
                    {platformStatus.isLoading && (
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    )}
                    {!platformStatus.isLoading && platformStatus.connected && (
                      <CheckCircle2 size={16} className="text-green-600" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {info.description}
                  </p>

                  {/* Connected Account Info */}
                  {platformStatus.connected && platformStatus.accountName && (
                    <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                      <span className="font-medium">Connected as:</span>
                      <span>{platformStatus.accountName}</span>
                    </div>
                  )}

                  {/* Error Message */}
                  {platformStatus.error && (
                    <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-2">
                      <XCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{platformStatus.error}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!platformStatus.connected ? (
                      <button
                        onClick={() => handleConnect(platformStatus.platform)}
                        disabled={platformStatus.isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`Connect to ${info.name}`}
                      >
                        {platformStatus.isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Connecting...
                          </span>
                        ) : (
                          'Connect Account'
                        )}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDisconnect(platformStatus.platform)}
                          disabled={platformStatus.isLoading}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          aria-label={`Disconnect from ${info.name}`}
                        >
                          {platformStatus.isLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 size={14} className="animate-spin" />
                              Disconnecting...
                            </span>
                          ) : (
                            'Disconnect'
                          )}
                        </button>
                        <a
                          href={`https://${platformStatus.platform}.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                          aria-label={`View ${info.name} dashboard`}
                        >
                          View Dashboard
                          <ExternalLink size={14} />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
        <div className="flex items-start gap-2">
          <Shield size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Secure OAuth Authentication
            </p>
            <p className="text-sm text-blue-800">
              Cauldron2Code uses OAuth to securely connect to your platforms. We only request
              permissions to create and deploy projects - never access to billing or other projects.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Lock size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Your Data is Protected
            </p>
            <p className="text-sm text-blue-800">
              Access tokens are encrypted and stored securely. You can disconnect at any time
              to revoke Cauldron2Code's access.{' '}
              <a 
                href="/DEPLOYMENT.md#step-1-connect-your-platform-account" 
                target="_blank"
                className="underline hover:text-blue-900"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
