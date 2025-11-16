'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check, Clock, Sparkles } from 'lucide-react';
import type { Deployment, PlatformType } from '@/lib/platforms/types';

interface DeploymentSuccessCardProps {
  deployment: Deployment;
  onViewChecklist?: () => void;
  className?: string;
}

const PLATFORM_INFO: Record<
  PlatformType,
  { name: string; color: string; icon: string }
> = {
  vercel: { name: 'Vercel', color: 'bg-black', icon: '▲' },
  railway: { name: 'Railway', color: 'bg-purple-600', icon: '🚂' },
  render: { name: 'Render', color: 'bg-blue-600', icon: '🎨' },
};

export function DeploymentSuccessCard({
  deployment,
  onViewChecklist,
  className = '',
}: DeploymentSuccessCardProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showSparkles, setShowSparkles] = useState(true);

  const platformInfo = PLATFORM_INFO[deployment.platform];

  // Hide sparkles after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowSparkles(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyUrl = async () => {
    if (!deployment.deploymentUrl) return;

    try {
      await navigator.clipboard.writeText(deployment.deploymentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={`relative bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 space-y-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 ${className}`}
    >
      {/* Sparkles Animation */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <Sparkles className="absolute top-4 right-4 text-yellow-400 animate-pulse" size={20} />
          <Sparkles className="absolute top-8 left-8 text-green-400 animate-pulse delay-100" size={16} />
          <Sparkles className="absolute bottom-8 right-12 text-blue-400 animate-pulse delay-200" size={18} />
        </div>
      )}

      {/* Success Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2 animate-in zoom-in duration-500 shadow-md">
          <span className="text-4xl animate-bounce">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-green-900 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          Deployment Successful!
        </h2>
        <p className="text-green-700 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          Your application is now live and ready to use
        </p>
      </div>

      {/* Deployment URL */}
      {deployment.deploymentUrl && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-green-900">
            Deployment URL
          </label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-white border border-green-300 rounded-lg font-mono text-sm text-gray-900 truncate">
              {deployment.deploymentUrl}
            </div>
            <button
              onClick={handleCopyUrl}
              className="px-4 py-3 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Copy deployment URL to clipboard"
            >
              {copiedUrl ? (
                <>
                  <Check size={16} />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span className="text-sm font-medium">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* View Live Site Button */}
      {deployment.deploymentUrl && (
        <a
          href={deployment.deploymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Open deployed application in new tab"
        >
          <ExternalLink size={20} />
          View Live Site
        </a>
      )}

      {/* Deployment Info */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-200">
        {/* Platform Badge */}
        <div>
          <p className="text-xs text-green-700 mb-1">Platform</p>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 ${platformInfo.color} text-white rounded-full text-sm font-medium`}
          >
            <span>{platformInfo.icon}</span>
            <span>{platformInfo.name}</span>
          </div>
        </div>

        {/* Deployment Time */}
        {deployment.duration && (
          <div>
            <p className="text-xs text-green-700 mb-1">Build Time</p>
            <div className="flex items-center gap-1.5 text-green-900">
              <Clock size={16} />
              <span className="font-semibold">
                {formatDuration(deployment.duration)}
              </span>
            </div>
          </div>
        )}

        {/* Completion Time */}
        {deployment.completedAt && (
          <div className="col-span-2">
            <p className="text-xs text-green-700 mb-1">Completed At</p>
            <p className="text-sm text-green-900 font-medium">
              {formatDate(deployment.completedAt)}
            </p>
          </div>
        )}
      </div>

      {/* Multi-Service Deployments */}
      {deployment.services.length > 0 && (
        <div className="pt-4 border-t border-green-200">
          <p className="text-sm font-medium text-green-900 mb-3">
            Deployed Services
          </p>
          <div className="space-y-2">
            {deployment.services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-600 truncate max-w-xs">
                    {service.url}
                  </p>
                </div>
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                >
                  Open
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {onViewChecklist && (
        <div className="pt-4 border-t border-green-200">
          <button
            onClick={onViewChecklist}
            className="w-full px-6 py-3 bg-white border-2 border-green-300 text-green-700 rounded-lg font-semibold hover:bg-green-50 hover:border-green-400 transition-all duration-200 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="View post-deployment setup checklist"
          >
            View Post-Deployment Checklist →
          </button>
          <p className="text-xs text-green-700 text-center mt-2">
            Complete setup steps to finalize your deployment
          </p>
        </div>
      )}
    </div>
  );
}
