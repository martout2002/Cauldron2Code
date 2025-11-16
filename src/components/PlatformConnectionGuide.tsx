'use client';

/**
 * PlatformConnectionGuide Component
 * 
 * Provides detailed guidance about OAuth permissions, security, and privacy
 * when connecting platform accounts.
 * Requirement 11.2: Explain OAuth permissions being requested
 */

import { Shield, Lock, Eye, XCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import type { PlatformType } from '@/lib/platforms/types';

interface PlatformConnectionGuideProps {
  platform: PlatformType;
  onClose?: () => void;
}

const PLATFORM_PERMISSIONS: Record<
  PlatformType,
  {
    name: string;
    permissions: {
      granted: string[];
      notGranted: string[];
    };
    dataAccess: string[];
    securityMeasures: string[];
  }
> = {
  vercel: {
    name: 'Vercel',
    permissions: {
      granted: [
        'Create new projects in your account',
        'Deploy applications to your projects',
        'Configure environment variables',
        'Read deployment status and logs',
      ],
      notGranted: [
        'Access existing projects not created by Cauldron2Code',
        'Modify billing or payment settings',
        'Delete projects or deployments',
        'Access team member information',
        'Modify account settings',
      ],
    },
    dataAccess: [
      'Project names and deployment URLs',
      'Build logs and deployment status',
      'Environment variable keys (values are encrypted)',
    ],
    securityMeasures: [
      'OAuth 2.0 authentication with PKCE',
      'Tokens encrypted with AES-256-GCM',
      'HTTP-only secure cookies',
      'Automatic token refresh',
      'Immediate revocation on disconnect',
    ],
  },
  railway: {
    name: 'Railway',
    permissions: {
      granted: [
        'Create new projects and services',
        'Deploy applications via Railway API',
        'Provision and configure databases',
        'Set environment variables',
        'Monitor deployment status',
      ],
      notGranted: [
        'Access existing projects not created by Cauldron2Code',
        'Modify billing or subscription',
        'Delete projects or services',
        'Access team settings',
        'Modify account preferences',
      ],
    },
    dataAccess: [
      'Project and service names',
      'Deployment status and logs',
      'Database connection strings (encrypted)',
    ],
    securityMeasures: [
      'OAuth 2.0 with Railway API',
      'End-to-end token encryption',
      'Secure cookie storage',
      'Rate limiting protection',
      'Automatic cleanup on disconnect',
    ],
  },
  render: {
    name: 'Render',
    permissions: {
      granted: [
        'Create web services and databases',
        'Deploy applications to Render',
        'Configure service settings',
        'Set environment variables',
        'Read deployment logs',
      ],
      notGranted: [
        'Access existing services not created by Cauldron2Code',
        'Modify billing information',
        'Delete services or databases',
        'Access team members',
        'Change account settings',
      ],
    },
    dataAccess: [
      'Service names and URLs',
      'Deployment status information',
      'Build and runtime logs',
    ],
    securityMeasures: [
      'OAuth 2.0 authentication',
      'AES-256 token encryption',
      'Secure HTTP-only cookies',
      'Scoped API access',
      'Revocable access tokens',
    ],
  },
};

export function PlatformConnectionGuide({
  platform,
  onClose,
}: PlatformConnectionGuideProps) {
  const info = PLATFORM_PERMISSIONS[platform];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Connecting to {info.name}
          </h3>
          <p className="text-sm text-gray-600">
            Understand what permissions Cauldron2Code requests and how your data is
            protected
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close guide"
          >
            <XCircle size={20} />
          </button>
        )}
      </div>

      {/* What Cauldron2Code CAN Do */}
      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={20} className="text-green-600" />
          <h4 className="font-semibold text-green-900">
            What Cauldron2Code CAN Do
          </h4>
        </div>
        <ul className="space-y-2">
          {info.permissions.granted.map((permission, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-green-800">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{permission}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What Cauldron2Code CANNOT Do */}
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-center gap-2 mb-3">
          <XCircle size={20} className="text-red-600" />
          <h4 className="font-semibold text-red-900">
            What Cauldron2Code CANNOT Do
          </h4>
        </div>
        <ul className="space-y-2">
          {info.permissions.notGranted.map((permission, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-red-800">
              <XCircle size={16} className="shrink-0 mt-0.5" />
              <span>{permission}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Data Access */}
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={20} className="text-blue-600" />
          <h4 className="font-semibold text-blue-900">Data Access</h4>
        </div>
        <p className="text-sm text-blue-800 mb-2">
          Cauldron2Code only accesses the following information:
        </p>
        <ul className="space-y-2">
          {info.dataAccess.map((data, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>{data}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Security Measures */}
      <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={20} className="text-purple-600" />
          <h4 className="font-semibold text-purple-900">Security Measures</h4>
        </div>
        <ul className="space-y-2">
          {info.securityMeasures.map((measure, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-purple-800">
              <Lock size={16} className="shrink-0 mt-0.5" />
              <span>{measure}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Privacy Notice */}
      <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
        <div className="flex items-start gap-2">
          <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">
              Your Privacy Matters
            </h4>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>• Cauldron2Code never stores your environment variable values</li>
              <li>• Access tokens are encrypted and stored securely</li>
              <li>• You can disconnect at any time to revoke access</li>
              <li>• We never share your data with third parties</li>
              <li>• All API calls are made over HTTPS</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disconnect Info */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-2">
          Disconnecting Your Account
        </h4>
        <p className="text-sm text-gray-700">
          You can disconnect your {info.name} account at any time from the
          platform connector. This will:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-700">
          <li>• Immediately revoke Cauldron2Code's access to your account</li>
          <li>• Delete all stored access tokens</li>
          <li>• Remove the OAuth connection from {info.name}</li>
          <li>• Keep your deployed projects running (they won't be affected)</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function PlatformConnectionGuideSummary({
  platform,
  onLearnMore,
}: {
  platform: PlatformType;
  onLearnMore?: () => void;
}) {
  const info = PLATFORM_PERMISSIONS[platform];

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
      <div className="flex items-start gap-2">
        <Shield size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 mb-1">
            Secure OAuth Connection
          </p>
          <p className="text-sm text-blue-800">
            Cauldron2Code will request permission to create and deploy projects on{' '}
            {info.name}. We never access billing, existing projects, or account
            settings.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Lock size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 mb-1">
            Your Data is Protected
          </p>
          <p className="text-sm text-blue-800">
            Access tokens are encrypted with AES-256 and stored in secure
            HTTP-only cookies. You can disconnect at any time.
          </p>
        </div>
      </div>
      {onLearnMore && (
        <button
          onClick={onLearnMore}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          Learn more about permissions and security →
        </button>
      )}
    </div>
  );
}
