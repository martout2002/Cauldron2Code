'use client';

import { useState, useEffect } from 'react';
import { X, Rocket, AlertCircle } from 'lucide-react';
import { PlatformConnector } from './PlatformConnector';
import { DeploymentConfigForm } from './DeploymentConfigForm';
import { DeploymentProgress } from './DeploymentProgress';
import { DeploymentSuccessCard } from './DeploymentSuccessCard';
import { PostDeploymentChecklist } from './PostDeploymentChecklist';
import type { ScaffoldConfig } from '@/types';
import type { PlatformType, Deployment } from '@/lib/platforms/types';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadId: string;
  scaffoldConfig: ScaffoldConfig;
}

type DeploymentStep = 'connect' | 'configure' | 'deploying' | 'success' | 'error';

export function DeploymentModal({
  isOpen,
  onClose,
  downloadId,
  scaffoldConfig,
}: DeploymentModalProps) {
  const [step, setStep] = useState<DeploymentStep>('connect');
  const [connectedPlatforms, setConnectedPlatforms] = useState<PlatformType[]>([]);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check connected platforms on mount
  useEffect(() => {
    if (isOpen) {
      checkConnectedPlatforms();
    }
  }, [isOpen]);

  const checkConnectedPlatforms = async () => {
    try {
      const platforms: PlatformType[] = ['vercel', 'railway', 'render'];
      const connected: PlatformType[] = [];

      for (const platform of platforms) {
        const response = await fetch(`/api/platforms/${platform}/auth/status`);
        const data = await response.json();
        if (data.connected) {
          connected.push(platform);
        }
      }

      setConnectedPlatforms(connected);

      // If at least one platform is connected, go to configure step
      if (connected.length > 0) {
        setStep('configure');
      }
    } catch (err) {
      console.error('Failed to check platform connections:', err);
    }
  };

  const handleConnectionChange = (platform: PlatformType, connected: boolean) => {
    if (connected) {
      setConnectedPlatforms((prev) => [...prev, platform]);
      // Move to configure step once connected
      setStep('configure');
    } else {
      setConnectedPlatforms((prev) => prev.filter((p) => p !== platform));
    }
  };

  const handleDeploymentSubmit = async (deploymentConfig: any) => {
    setStep('deploying');
    setError(null);

    try {
      const response = await fetch('/api/deploy/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          downloadId,
          scaffoldConfig,
          ...deploymentConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      setDeploymentId(data.deploymentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed');
      setStep('error');
    }
  };

  const handleDeploymentComplete = (completedDeployment: Deployment) => {
    setDeployment(completedDeployment);
    setStep('success');
  };

  const handleDeploymentError = (error: any) => {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Deployment failed';
    setError(errorMessage);
    setStep('error');
  };

  const handleClose = () => {
    if (step === 'deploying') {
      // Don't allow closing during deployment
      return;
    }
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setStep('connect');
      setDeploymentId(null);
      setDeployment(null);
      setError(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Rocket size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Deploy Your Project</h2>
              <p className="text-sm text-gray-600">
                {step === 'connect' && 'Connect to a hosting platform'}
                {step === 'configure' && 'Configure your deployment'}
                {step === 'deploying' && 'Deploying your application...'}
                {step === 'success' && 'Deployment successful!'}
                {step === 'error' && 'Deployment failed'}
              </p>
            </div>
          </div>
          {step !== 'deploying' && (
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Step 1: Connect Platform */}
          {step === 'connect' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>First time deploying?</strong> Connect your Vercel account to get started.
                  Your credentials are stored securely and you can disconnect at any time.
                </p>
              </div>

              <PlatformConnector
                onConnectionChange={handleConnectionChange}
                className="max-w-2xl mx-auto"
              />

              <div className="text-center text-sm text-gray-500">
                Once connected, you'll be able to configure and deploy your project
              </div>
            </div>
          )}

          {/* Step 2: Configure Deployment */}
          {step === 'configure' && (
            <DeploymentConfigForm
              scaffoldConfig={scaffoldConfig}
              connectedPlatforms={connectedPlatforms}
              onSubmit={handleDeploymentSubmit}
              onCancel={handleClose}
            />
          )}

          {/* Step 3: Deploying */}
          {step === 'deploying' && deploymentId && (
            <div className="space-y-6">
              <DeploymentProgress
                deploymentId={deploymentId}
                onComplete={handleDeploymentComplete}
                onError={handleDeploymentError}
              />
              <div className="text-center text-sm text-gray-500">
                This may take a few minutes. Please don't close this window.
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && deployment && (
            <div className="space-y-6">
              <DeploymentSuccessCard
                deployment={deployment}
                onViewChecklist={() => {}}
              />

              <PostDeploymentChecklist deployment={deployment} />

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <a
                  href={deployment.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Live Site
                </a>
              </div>
            </div>
          )}

          {/* Step 5: Error */}
          {step === 'error' && (
            <div className="space-y-6">
              <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      Deployment Failed
                    </h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('configure')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Common Issues:</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Check that your platform connection is still active</li>
                  <li>Verify all required environment variables are set</li>
                  <li>Ensure your project name is unique</li>
                  <li>Try disconnecting and reconnecting your platform</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
