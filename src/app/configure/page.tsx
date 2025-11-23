'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PixelArtWizard } from '@/components/wizard/PixelArtWizard';
import { ToastContainer } from '@/components/Toast';
import { useConfigStore } from '@/lib/store/config-store';
import { useValidation } from '@/lib/validation/useValidation';
import { useToast } from '@/lib/hooks/useToast';
import { GenerationProgress } from '@/components/GenerationProgress';
import { DownloadButton } from '@/components/DownloadButton';
import { CreateRepoModal } from '@/components/CreateRepoModal';
import { DeploymentModal } from '@/components/DeploymentModal';
import { ErrorMessage, ERROR_MESSAGES } from '@/components/ErrorMessage';
import { Github, Rocket, ExternalLink, CheckCircle2, Settings, BookOpen } from 'lucide-react';

export default function ConfigurePage() {
  const { config } = useConfigStore();
  
  // Wire validation engine to configuration changes
  const { validationResult } = useValidation(config);
  
  // Toast notifications for user feedback
  const toast = useToast();

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // GitHub repository state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null);
  const [repoModalError, setRepoModalError] = useState<string | null>(null);
  const [lastRepoData, setLastRepoData] = useState<{
    name: string;
    description: string;
    private: boolean;
  } | null>(null);

  // Deployment modal state
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Check GitHub authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/github/auth/status');
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (err) {
        console.error('Failed to check auth status:', err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Handle generation trigger from wizard
  const handleGenerate = async () => {
    // Validate configuration
    if (validationResult.errors.length > 0) {
      toast.error('Configuration Invalid', 'Please fix all errors before generating');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setDownloadId(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        // Provide specific error messages based on status
        if (response.status === 408 || response.status === 504) {
          throw new Error('timeout');
        } else if (response.status >= 500) {
          throw new Error('server');
        } else if (response.status === 400) {
          throw new Error('invalid_config');
        }
        throw new Error(data.error || 'generation_failed');
      }

      // Set download ID directly from response
      setDownloadId(data.downloadId);
      setIsGenerating(false);
      toast.success('Scaffold Generated!', 'Your project is ready to download');
    } catch (err) {
      let errorType = 'generation_failed';
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorType = 'network';
      } else if (err instanceof Error) {
        errorType = err.message;
      }
      
      setError(errorType);
      setIsGenerating(false);
      toast.error('Generation Failed', errorType);
    }
  };

  // Handle repository creation
  const handleRepoSubmit = async (repoData: {
    name: string;
    description: string;
    private: boolean;
  }) => {
    setLastRepoData(repoData);
    setRepoModalError(null);
    setIsCreatingRepo(true);

    try {
      const response = await fetch('/api/github/repos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repoData.name,
          description: repoData.description,
          private: repoData.private,
          config: config,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsCreatingRepo(false);
        
        if (response.status === 401) {
          setRepoModalError(data.message || 'Authentication failed. Please sign in again.');
        } else if (response.status === 409) {
          setRepoModalError(data.message || 'Repository name already exists. Please choose a different name.');
        } else if (response.status === 408 || response.status === 503) {
          setRepoModalError(data.message || 'Network error. Please check your connection and try again.');
        } else {
          setRepoModalError(data.message || data.error || 'Failed to create repository');
        }
        return;
      }

      // Success
      setIsCreatingRepo(false);
      setShowRepoModal(false);
      setRepoModalError(null);
      setLastRepoData(null);
      setRepositoryUrl(data.repository.htmlUrl);
      toast.success('Repository Created!', 'Your scaffold has been pushed to GitHub');
    } catch (err) {
      console.error('Failed to create repository:', err);
      setIsCreatingRepo(false);
      const errorMsg = err instanceof Error ? err.message : 'Network error. Please try again.';
      setRepoModalError(errorMsg);
    }
  };

  return (
    <>
      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
      
      {/* UI Switcher Link - Only show during wizard phase */}
      {!downloadId && !repositoryUrl && !isGenerating && (
        <Link
          href="/configure-old"
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-zinc-900/80 hover:bg-zinc-800/90 text-white text-sm rounded-lg border border-zinc-700 transition-all duration-200 backdrop-blur-sm hover:shadow-lg group"
          aria-label="Switch to classic configuration wizard"
        >
          <Settings size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">Classic UI</span>
        </Link>
      )}
      
      {/* Main Wizard */}
      {!downloadId && !repositoryUrl && !isGenerating && (
        <PixelArtWizard onGenerate={handleGenerate} />
      )}

      {/* Generation Progress */}
      {isGenerating && downloadId && (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
          <div className="w-full max-w-2xl">
            <GenerationProgress
              generationId={downloadId}
              onComplete={(completedDownloadId) => {
                setIsGenerating(false);
                setDownloadId(completedDownloadId);
              }}
              onError={(errorMessage) => {
                setIsGenerating(false);
                setError(errorMessage);
              }}
            />
          </div>
        </div>
      )}

      {/* Fallback loading state */}
      {isGenerating && !downloadId && (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="pixel-subtitle text-white">Starting generation...</p>
          </div>
        </div>
      )}

      {/* Success State - Download Options */}
      {downloadId && !isGenerating && !repositoryUrl && (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-20">
          <div className="w-full max-w-2xl space-y-4">
            <div className="text-center mb-8">
              <h1 className="pixel-title text-white mb-2">Your Spell is Ready!</h1>
              <p className="pixel-subtitle text-gray-300">Choose how to proceed with your magical creation</p>
            </div>

            {/* Download ZIP Option */}
            <DownloadButton
              downloadId={downloadId}
              onRetryExhausted={() => {
                setError('Download failed after multiple attempts. Please regenerate your scaffold.');
              }}
            />

            {/* View Deployment Guides Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-zinc-950 text-gray-500">or</span>
              </div>
            </div>

            <Link
              href={`/guides?configId=${downloadId}${repositoryUrl ? `&repoUrl=${encodeURIComponent(repositoryUrl)}` : ''}`}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium text-base hover:bg-purple-700 active:bg-purple-800 transition-all"
            >
              <BookOpen size={20} />
              <div className="flex flex-col items-start">
                <span>View Deployment Guides</span>
                <span className="text-xs text-purple-200 font-normal">Step-by-step instructions for any platform</span>
              </div>
            </Link>

            {/* Deploy Now Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-zinc-950 text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={() => setShowDeployModal(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 active:bg-blue-800 transition-all"
            >
              <Rocket size={20} />
              Deploy Now
            </button>

            {/* GitHub Repository Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-zinc-950 text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={() => setShowRepoModal(true)}
              disabled={!isAuthenticated}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-base transition-all ${
                isAuthenticated
                  ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 border border-gray-700'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
              }`}
            >
              <Github size={20} />
              Create GitHub Repository
            </button>

            {!isAuthenticated && (
              <p className="text-xs text-center text-gray-500">
                Sign in with GitHub to create repositories directly
              </p>
            )}

            {/* Error Display */}
            {error && (
              <ErrorMessage
                title={
                  error === 'network'
                    ? ERROR_MESSAGES.NETWORK_ERROR.title
                    : error === 'timeout'
                    ? ERROR_MESSAGES.TIMEOUT_ERROR.title
                    : error === 'invalid_config'
                    ? ERROR_MESSAGES.INVALID_CONFIG.title
                    : ERROR_MESSAGES.GENERATION_FAILED.title
                }
                message={
                  error === 'network'
                    ? ERROR_MESSAGES.NETWORK_ERROR.message
                    : error === 'timeout'
                    ? ERROR_MESSAGES.TIMEOUT_ERROR.message
                    : error === 'invalid_config'
                    ? ERROR_MESSAGES.INVALID_CONFIG.message
                    : ERROR_MESSAGES.GENERATION_FAILED.message
                }
                suggestions={
                  error === 'network'
                    ? ERROR_MESSAGES.NETWORK_ERROR.suggestions
                    : error === 'timeout'
                    ? ERROR_MESSAGES.TIMEOUT_ERROR.suggestions
                    : error === 'invalid_config'
                    ? ERROR_MESSAGES.INVALID_CONFIG.suggestions
                    : ERROR_MESSAGES.GENERATION_FAILED.suggestions
                }
                onRetry={() => {
                  setError(null);
                  handleGenerate();
                }}
              />
            )}

            <button
              onClick={() => {
                setDownloadId(null);
                setError(null);
              }}
              className="w-full px-6 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}

      {/* Repository Success State */}
      {repositoryUrl && (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-20">
          <div className="w-full max-w-2xl">
            <div className="p-6 bg-green-900/20 border-2 border-green-500 rounded-lg space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={32} className="text-green-500 shrink-0 mt-1 animate-in zoom-in duration-300" />
                <div className="flex-1">
                  <p className="text-xl text-green-400 font-bold pixel-title">
                    🎉 Repository Created Successfully!
                  </p>
                  <p className="text-base text-green-300 mt-2">
                    Your scaffold has been pushed to GitHub and is ready to use.
                  </p>
                </div>
              </div>

              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-base hover:bg-green-700 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <ExternalLink size={20} />
                Go to Repository
              </a>
            </div>

            <button
              onClick={() => {
                setRepositoryUrl(null);
                setDownloadId(null);
                setError(null);
              }}
              className="w-full px-6 py-2 mt-4 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Create Another Repository
            </button>
          </div>
        </div>
      )}

      {/* Deployment Modal */}
      {showDeployModal && downloadId && (
        <DeploymentModal
          isOpen={showDeployModal}
          onClose={() => setShowDeployModal(false)}
          downloadId={downloadId}
          scaffoldConfig={config}
        />
      )}

      {/* Repository Creation Modal */}
      {showRepoModal && (
        <CreateRepoModal
          isOpen={showRepoModal}
          onClose={() => {
            if (!isCreatingRepo) {
              setShowRepoModal(false);
              setRepoModalError(null);
              setLastRepoData(null);
            }
          }}
          error={repoModalError}
          isLoading={isCreatingRepo}
          onRetry={() => {
            if (lastRepoData) {
              setRepoModalError(null);
              handleRepoSubmit(lastRepoData);
            }
          }}
          onErrorDismiss={() => setRepoModalError(null)}
          onSubmit={handleRepoSubmit}
          initialName={config.projectName}
          initialDescription={config.description}
        />
      )}
    </>
  );
}
