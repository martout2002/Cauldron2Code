'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import type { PlatformType } from '@/lib/platforms/types';

interface PlatformStatus {
  platform: PlatformType;
  status: 'operational' | 'degraded' | 'outage' | 'unknown';
  message?: string;
  lastChecked: Date;
}

interface PlatformStatusCheckerProps {
  platforms: PlatformType[];
  onPlatformSelect?: (platform: PlatformType) => void;
  className?: string;
}

const PLATFORM_NAMES: Record<PlatformType, string> = {
  vercel: 'Vercel',
  railway: 'Railway',
  render: 'Render',
};

const PLATFORM_STATUS_URLS: Record<PlatformType, string> = {
  vercel: 'https://www.vercel-status.com/',
  railway: 'https://status.railway.app/',
  render: 'https://status.render.com/',
};

export function PlatformStatusChecker({
  platforms,
  onPlatformSelect,
  className = '',
}: PlatformStatusCheckerProps) {
  const [statuses, setStatuses] = useState<Map<PlatformType, PlatformStatus>>(new Map());
  const [isChecking, setIsChecking] = useState(false);

  // Define checkPlatformHealth before it's used
  const checkPlatformHealth = useCallback(async (platform: PlatformType): Promise<PlatformStatus> => {
    // Simulate health check - in production, this would call actual status APIs
    // or check if we can reach the platform's API endpoints
    try {
      // Try to make a simple request to detect if platform is reachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(`/api/platforms/${platform}/auth/status`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If we get any response (even 401), the platform is operational
      return {
        platform,
        status: 'operational',
        message: 'All systems operational',
        lastChecked: new Date(),
      };
    } catch (error: any) {
      // Network errors or timeouts indicate potential outage
      if (error.name === 'AbortError' || error.message?.includes('ECONNREFUSED')) {
        return {
          platform,
          status: 'outage',
          message: 'Platform may be experiencing issues',
          lastChecked: new Date(),
        };
      }

      return {
        platform,
        status: 'unknown',
        message: 'Unable to determine status',
        lastChecked: new Date(),
      };
    }
  }, []);

  const checkPlatformStatuses = useCallback(async () => {
    setIsChecking(true);

    const newStatuses = new Map<PlatformType, PlatformStatus>();

    for (const platform of platforms) {
      try {
        // In a real implementation, this would check the platform's status API
        // For now, we'll simulate by checking if we can reach the API
        const status = await checkPlatformHealth(platform);
        newStatuses.set(platform, status);
      } catch {
        newStatuses.set(platform, {
          platform,
          status: 'unknown',
          message: 'Unable to check status',
          lastChecked: new Date(),
        });
      }
    }

    setStatuses(newStatuses);
    setIsChecking(false);
  }, [platforms, checkPlatformHealth]);

  useEffect(() => {
    // Use microtask to defer the async call
    Promise.resolve().then(() => checkPlatformStatuses());
  }, [checkPlatformStatuses]);

  const getStatusIcon = (status: PlatformStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 size={18} className="text-green-600" />;
      case 'degraded':
        return <AlertTriangle size={18} className="text-yellow-600" />;
      case 'outage':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return <AlertTriangle size={18} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: PlatformStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'border-green-200 bg-green-50';
      case 'degraded':
        return 'border-yellow-200 bg-yellow-50';
      case 'outage':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusTextColor = (status: PlatformStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'text-green-800';
      case 'degraded':
        return 'text-yellow-800';
      case 'outage':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const hasOutages = Array.from(statuses.values()).some(
    (s) => s.status === 'outage' || s.status === 'degraded'
  );

  const operationalPlatforms = Array.from(statuses.entries())
    .filter(([_, status]) => status.status === 'operational')
    .map(([platform]) => platform);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Platform Status</h3>
        <button
          onClick={checkPlatformStatuses}
          disabled={isChecking}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Status Cards */}
      <div className="space-y-2">
        {platforms.map((platform) => {
          const status = statuses.get(platform);
          if (!status) return null;

          return (
            <div
              key={platform}
              className={`p-3 border rounded-lg transition-all ${getStatusColor(
                status.status
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(status.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {PLATFORM_NAMES[platform]}
                      </h4>
                      <span
                        className={`text-xs font-medium ${getStatusTextColor(
                          status.status
                        )}`}
                      >
                        {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                      </span>
                    </div>
                    {status.message && (
                      <p className="text-sm text-gray-700 mt-0.5">{status.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Last checked: {status.lastChecked.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {status.status === 'operational' && onPlatformSelect && (
                    <button
                      onClick={() => onPlatformSelect(platform)}
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors"
                    >
                      Use This
                    </button>
                  )}
                  <a
                    href={PLATFORM_STATUS_URLS[platform]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    title="View status page"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {hasOutages && operationalPlatforms.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-1">
            💡 Recommendation
          </p>
          <p className="text-sm text-blue-800">
            Some platforms are experiencing issues. Consider using{' '}
            {operationalPlatforms.map((p) => PLATFORM_NAMES[p]).join(' or ')} for
            better reliability.
          </p>
        </div>
      )}

      {/* All platforms down */}
      {hasOutages && operationalPlatforms.length === 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900 font-medium mb-1">
            ⚠️ Multiple Platform Issues
          </p>
          <p className="text-sm text-yellow-800">
            Multiple platforms are experiencing issues. You can download your project as
            a ZIP file or create a GitHub repository to deploy manually later.
          </p>
        </div>
      )}
    </div>
  );
}
