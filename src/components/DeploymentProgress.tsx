'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle, Info } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { BuildLogViewer } from './BuildLogViewer';
import { DeploymentErrorCard } from './DeploymentErrorCard';
import type { Deployment, DeploymentError } from '@/lib/platforms/types';

interface DeploymentProgressProps {
  deploymentId: string;
  onComplete?: (deployment: Deployment) => void;
  onError?: (error: DeploymentError) => void;
  onRetry?: () => void;
  onReconnect?: () => void;
  onDownloadZip?: () => void;
  onCreateGitHub?: () => void;
  className?: string;
}

type DeploymentStep =
  | 'pending'
  | 'creating'
  | 'uploading'
  | 'configuring'
  | 'building'
  | 'deploying'
  | 'success'
  | 'failed';

const STEP_LABELS: Record<DeploymentStep, string> = {
  pending: 'Initializing',
  creating: 'Creating Project',
  uploading: 'Uploading Files',
  configuring: 'Configuring Environment',
  building: 'Building Application',
  deploying: 'Deploying',
  success: 'Deployment Complete',
  failed: 'Deployment Failed',
};

// Step descriptions for tooltips/help text
// const STEP_DESCRIPTIONS: Record<DeploymentStep, string> = {
//   pending: 'Preparing deployment...',
//   creating: 'Setting up project on platform...',
//   uploading: 'Transferring files to platform...',
//   configuring: 'Setting environment variables...',
//   building: 'Compiling and building application...',
//   deploying: 'Publishing to production...',
//   success: 'Your application is live!',
//   failed: 'Something went wrong',
// };

const STEP_ORDER: DeploymentStep[] = [
  'pending',
  'creating',
  'uploading',
  'configuring',
  'building',
  'deploying',
  'success',
];

export function DeploymentProgress({
  deploymentId,
  onComplete,
  onError,
  onRetry,
  onReconnect,
  onDownloadZip,
  onCreateGitHub,
  className = '',
}: DeploymentProgressProps) {
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [currentStep, setCurrentStep] = useState<DeploymentStep>('pending');
  const [showLogs, setShowLogs] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Track elapsed time
  useEffect(() => {
    if (!deployment || deployment.status === 'success' || deployment.status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [deployment]);

  // Check if approaching timeout (4 minutes = 240 seconds)
  const isApproachingTimeout = elapsedTime >= 240 && elapsedTime < 300;
  const hasTimedOut = elapsedTime >= 300;

  // Connect to SSE endpoint for real-time updates
  useEffect(() => {
    const eventSource = new EventSource(`/api/deploy/status/${deploymentId}`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const update: Deployment = JSON.parse(event.data);
        setDeployment(update);

        // Map deployment status to step
        if (update.status === 'pending') {
          setCurrentStep('creating');
        } else if (update.status === 'building') {
          // Determine sub-step based on progress or logs
          const lastLog = update.buildLogs[update.buildLogs.length - 1] || '';
          if (lastLog.toLowerCase().includes('upload')) {
            setCurrentStep('uploading');
          } else if (lastLog.toLowerCase().includes('configur')) {
            setCurrentStep('configuring');
          } else {
            setCurrentStep('building');
          }
        } else if (update.status === 'deploying') {
          setCurrentStep('deploying');
        } else if (update.status === 'success') {
          setCurrentStep('success');
          if (onComplete) {
            onComplete(update);
          }
        } else if (update.status === 'failed') {
          setCurrentStep('failed');
          if (onError && update.error) {
            onError(update.error);
          }
        }
      } catch (error) {
        console.error('Failed to parse deployment update:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();

      // If we haven't received any data yet, show error
      if (!deployment) {
        setCurrentStep('failed');
        if (onError) {
          onError({
            code: 'CONNECTION_ERROR',
            message: 'Lost connection to deployment server',
            step: 'deploy',
            recoverable: true,
            suggestions: ['Refresh the page to check status'],
          });
        }
      }
    };

    return () => {
      eventSource.close();
    };
  }, [deploymentId]);

  const getStepStatus = (
    step: DeploymentStep
  ): 'pending' | 'active' | 'complete' | 'error' => {
    if (currentStep === 'failed') {
      const stepIndex = STEP_ORDER.indexOf(step);
      const currentIndex = STEP_ORDER.indexOf(currentStep);
      if (stepIndex < currentIndex) return 'complete';
      return 'error';
    }

    const stepIndex = STEP_ORDER.indexOf(step);
    const currentIndex = STEP_ORDER.indexOf(currentStep);

    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (!deployment && !isConnected) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-3 animate-in fade-in duration-500">
          <div className="relative">
            <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Loader2 size={32} className="text-blue-600 mx-auto" />
            </div>
          </div>
          <p className="text-sm text-gray-600 animate-pulse">Connecting to deployment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {deployment?.projectName || 'Deploying Project'}
          </h2>
          <Tooltip content="Watch your deployment progress in real-time. Build logs are available below. Typical deployments complete in 2-5 minutes.">
            <Info size={18} className="text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>Platform: {deployment?.platform || 'Unknown'}</span>
          {elapsedTime > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{formatDuration(elapsedTime)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        {STEP_ORDER.filter(
          (step) => step !== 'success' && step !== 'failed'
        ).map((step) => {
          const status = getStepStatus(step);

          return (
            <div
              key={step}
              className="flex items-center gap-3 transition-all duration-300"
              style={{
                opacity: status === 'pending' ? 0.5 : 1,
              }}
            >
              {/* Step Icon */}
              <div
                className="shrink-0 transition-transform duration-200"
                style={{
                  transform: status === 'active' ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {status === 'complete' && (
                  <CheckCircle2
                    size={24}
                    className="text-green-600 animate-in zoom-in duration-300"
                  />
                )}
                {status === 'active' && (
                  <Loader2 size={24} className="text-blue-600 animate-spin" />
                )}
                {status === 'error' && (
                  <XCircle
                    size={24}
                    className="text-red-600 animate-in zoom-in duration-300"
                  />
                )}
                {status === 'pending' && (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                )}
              </div>

              {/* Step Label */}
              <div className="flex-1">
                <p
                  className={`text-base font-medium transition-colors duration-200 ${
                    status === 'complete'
                      ? 'text-green-700'
                      : status === 'active'
                      ? 'text-blue-700'
                      : status === 'error'
                      ? 'text-red-700'
                      : 'text-gray-500'
                  }`}
                >
                  {STEP_LABELS[step]}
                </p>
              </div>

              {/* Progress Bar */}
              {status === 'active' && (
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Build Logs */}
      {deployment && deployment.buildLogs.length > 0 && (
        <div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline mb-2 font-medium"
          >
            {showLogs ? 'Hide' : 'Show'} Build Logs ({deployment.buildLogs.length})
          </button>

          {showLogs && <BuildLogViewer logs={deployment.buildLogs} />}
        </div>
      )}

      {/* Timeout Warning */}
      {isApproachingTimeout && !hasTimedOut && deployment?.status !== 'success' && deployment?.status !== 'failed' && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Deployment taking longer than expected</p>
            <p className="mt-1">
              This deployment has been running for over 4 minutes. It will timeout at 5 minutes,
              but may continue on the platform. You can check the platform dashboard if it times out.
            </p>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && deployment && deployment.status !== 'success' && deployment.status !== 'failed' && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <XCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Connection lost</p>
            <p className="mt-1">
              Trying to reconnect... Your deployment may still be in progress.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {currentStep === 'failed' && deployment?.error && (
        <DeploymentErrorCard
          error={deployment.error}
          platform={deployment.platform}
          projectName={deployment.projectName}
          onRetry={onRetry}
          onReconnect={onReconnect}
          onDownloadZip={onDownloadZip}
          onCreateGitHub={onCreateGitHub}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        />
      )}

      {/* Success State Preview (actual success card is separate component) */}
      {currentStep === 'success' && deployment?.deploymentUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium">
                🎉 Deployment Successful!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Your application is now live and accessible.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
