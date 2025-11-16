'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Deployment, PlatformType, EnvironmentVariable } from '@/lib/platforms/types';
import { BuildLogViewer } from '@/components/BuildLogViewer';
import { RedeployModal } from '@/components/RedeployModal';

export default function DeploymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const deploymentId = params.id as string;

  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeploying, setRedeploying] = useState(false);
  const [showAllEnvVars, setShowAllEnvVars] = useState(false);
  const [showRedeployModal, setShowRedeployModal] = useState(false);

  useEffect(() => {
    fetchDeployment();
  }, [deploymentId]);

  const fetchDeployment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/deployments/${deploymentId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Deployment not found');
        }
        throw new Error('Failed to fetch deployment details');
      }

      const data = await response.json();
      setDeployment(data.deployment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeploy = async (envVars?: EnvironmentVariable[]) => {
    if (!deployment) return;

    try {
      setRedeploying(true);
      setShowRedeployModal(false);

      const response = await fetch('/api/deploy/redeploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deploymentId: deployment.id,
          environmentVariables: envVars,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initiate redeployment');
      }

      const data = await response.json();

      // Redirect to the new deployment's details page
      router.push(`/deployments/${data.deploymentId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to redeploy');
      setRedeploying(false);
    }
  };

  const getStatusBadge = (status: Deployment['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      building: 'bg-blue-100 text-blue-800',
      deploying: 'bg-purple-100 text-purple-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlatformBadge = (platform: PlatformType) => {
    const styles = {
      vercel: 'bg-black text-white',
      railway: 'bg-purple-600 text-white',
      render: 'bg-blue-600 text-white',
    };

    return (
      <span className={`px-3 py-1 rounded text-sm font-medium ${styles[platform]}`}>
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const maskValue = (value: string, sensitive: boolean) => {
    if (!sensitive) return value;
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading deployment details...</p>
        </div>
      </div>
    );
  }

  if (error || !deployment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Deployment not found'}</p>
          <Link
            href="/deployments"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Deployments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/deployments"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Back to Deployments
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {deployment.projectName}
              </h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(deployment.status)}
                {getPlatformBadge(deployment.platform)}
              </div>
            </div>
            {deployment.status === 'success' && (
              <button
                onClick={() => setShowRedeployModal(true)}
                disabled={redeploying}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {redeploying ? 'Redeploying...' : 'Redeploy'}
              </button>
            )}
          </div>
        </div>

        {/* Deployment URL */}
        {deployment.deploymentUrl && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Deployment URL</h2>
            <div className="flex items-center gap-3">
              <a
                href={deployment.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {deployment.deploymentUrl}
              </a>
              <a
                href={deployment.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
              >
                View Live Site →
              </a>
            </div>
          </div>
        )}

        {/* Deployment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Deployment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-gray-900">{formatDate(deployment.createdAt)}</p>
            </div>
            {deployment.completedAt && (
              <div>
                <p className="text-sm text-gray-500">Completed At</p>
                <p className="text-gray-900">{formatDate(deployment.completedAt)}</p>
              </div>
            )}
            {deployment.duration && (
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-gray-900">{formatDuration(deployment.duration)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Deployment ID</p>
              <p className="text-gray-900 font-mono text-sm">{deployment.id}</p>
            </div>
          </div>
        </div>

        {/* Services (for monorepo) */}
        {deployment.services.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Services</h2>
            <div className="space-y-3">
              {deployment.services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-500">{service.url}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(service.status)}
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Visit →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Framework</p>
              <p className="text-gray-900">
                {deployment.config.scaffoldConfig.frontendFramework || 'N/A'}
              </p>
            </div>
            {deployment.config.scaffoldConfig.backendFramework && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Backend</p>
                <p className="text-gray-900">
                  {deployment.config.scaffoldConfig.backendFramework}
                </p>
              </div>
            )}
            {deployment.config.scaffoldConfig.database && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Database</p>
                <p className="text-gray-900">
                  {deployment.config.scaffoldConfig.database}
                </p>
              </div>
            )}
            {deployment.config.scaffoldConfig.auth && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Authentication</p>
                <p className="text-gray-900">
                  {deployment.config.scaffoldConfig.auth}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Environment Variables</h2>
            <button
              onClick={() => setShowAllEnvVars(!showAllEnvVars)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showAllEnvVars ? 'Hide Values' : 'Show Values'}
            </button>
          </div>
          {deployment.config.environmentVariables.length === 0 ? (
            <p className="text-gray-500 text-sm">No environment variables configured</p>
          ) : (
            <div className="space-y-3">
              {deployment.config.environmentVariables.map((envVar) => (
                <div
                  key={envVar.key}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 font-mono text-sm">
                        {envVar.key}
                      </p>
                      {envVar.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {envVar.description}
                        </p>
                      )}
                      {showAllEnvVars && envVar.value && (
                        <p className="text-sm text-gray-700 mt-2 font-mono bg-gray-50 p-2 rounded break-all">
                          {maskValue(envVar.value, envVar.sensitive)}
                        </p>
                      )}
                    </div>
                    {envVar.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded ml-2">
                        Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Details */}
        {deployment.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-3">Error Details</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-red-600 font-medium">Error Code</p>
                <p className="text-red-900 font-mono">{deployment.error.code}</p>
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Message</p>
                <p className="text-red-900">{deployment.error.message}</p>
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Step</p>
                <p className="text-red-900">{deployment.error.step}</p>
              </div>
              {deployment.error.suggestions.length > 0 && (
                <div>
                  <p className="text-sm text-red-600 font-medium mb-1">Suggestions</p>
                  <ul className="list-disc list-inside space-y-1">
                    {deployment.error.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-red-900 text-sm">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Build Logs */}
        {deployment.buildLogs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Build Logs</h2>
            <BuildLogViewer logs={deployment.buildLogs} />
          </div>
        )}
      </div>

      {/* Redeploy Modal */}
      <RedeployModal
        isOpen={showRedeployModal}
        onClose={() => setShowRedeployModal(false)}
        onConfirm={handleRedeploy}
        environmentVariables={deployment.config.environmentVariables}
        projectName={deployment.projectName}
      />
    </div>
  );
}
