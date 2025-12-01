'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PixelArtWizard } from '@/components/wizard/PixelArtWizard';
import { ToastContainer } from '@/components/Toast';
import { useConfigStore } from '@/lib/store/config-store';
import { useValidation } from '@/lib/validation/useValidation';
import { useToast } from '@/lib/hooks/useToast';
import { GenerationLoadingScreen } from '@/components/GenerationLoadingScreen';
import { ErrorMessage, ERROR_MESSAGES } from '@/components/ErrorMessage';
import { sanitizeRepoName } from '@/lib/github/repo-name-sanitizer';
import { ExternalLink, CheckCircle2, Settings, BookOpen } from 'lucide-react';

export default function ConfigurePage() {
  const { config, setGithubRepoUrl } = useConfigStore();
  
  // Wire validation engine to configuration changes
  const { validationResult } = useValidation(config);
  
  // Toast notifications for user feedback
  const toast = useToast();

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GitHub repository state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null);
  const [repositoryName, setRepositoryName] = useState<string | null>(null);
  const [repositoryDescription, setRepositoryDescription] = useState<string | null>(null);

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
    // Check if repository already exists for GitHub-enabled configs
    // Only reuse if GitHub is enabled and authenticated
    const githubEnabled = (config.githubEnabled ?? false) && isAuthenticated;
    if (githubEnabled && config.githubRepoUrl) {
      console.log('Repository already exists, using existing URL:', config.githubRepoUrl);
      setRepositoryUrl(config.githubRepoUrl);
      setRepositoryName(config.projectName);
      setRepositoryDescription(config.description);
      return;
    }

    // Prevent multiple simultaneous generation requests
    // Requirements: 2.5
    if (isGenerating || showLoadingScreen) {
      console.warn('Generation already in progress, ignoring duplicate request');
      return;
    }

    // Validate configuration
    if (validationResult.errors.length > 0) {
      toast.error('Configuration Invalid', 'Please fix all errors before generating');
      return;
    }

    // Set states to show loading screen and prevent duplicate requests
    setIsGenerating(true);
    setShowLoadingScreen(true);
    setError(null);
    setRepositoryUrl(null);

    try {
      // GitHub workflow: Create repository and push scaffold
      // Sanitize repository name to comply with GitHub naming rules
      const sanitizedRepoName = sanitizeRepoName(config.projectName);
      
      const response = await fetch('/api/github/repos/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitizedRepoName,
          description: config.description,
          private: config.githubRepoPrivate ?? false,
          config: config,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle GitHub-specific errors
        if (response.status === 401 || response.status === 403) {
          throw new Error('github_auth');
        } else if (response.status === 409 || response.status === 422) {
          // Repository already exists - try to use stored URL or construct it
          if (config.githubRepoUrl) {
            console.log('Repository conflict, using stored URL:', config.githubRepoUrl);
            setRepositoryUrl(config.githubRepoUrl);
            setRepositoryName(config.projectName);
            setRepositoryDescription(config.description);
            setShowLoadingScreen(false);
            setIsGenerating(false);
            toast.success('Using Existing Repository', 'Repository already exists');
            return;
          } else {
            // Try to get GitHub username and construct URL
            try {
              const userResponse = await fetch('/api/github/auth/status');
              const userData = await userResponse.json();
              if (userData.authenticated && userData.user?.login) {
                const constructedUrl = `https://github.com/${userData.user.login}/${sanitizedRepoName}`;
                console.log('Repository conflict, constructed URL:', constructedUrl);
                setRepositoryUrl(constructedUrl);
                setRepositoryName(config.projectName);
                setRepositoryDescription(config.description);
                setGithubRepoUrl(constructedUrl); // Store for future use
                setShowLoadingScreen(false);
                setIsGenerating(false);
                toast.success('Using Existing Repository', 'Repository already exists');
                return;
              }
            } catch (err) {
              console.error('Failed to construct repository URL:', err);
            }
          }
          throw new Error('github_conflict');
        } else if (response.status === 429) {
          throw new Error('github_rate_limit');
        } else if (response.status === 408 || response.status === 504) {
          throw new Error('timeout');
        } else if (response.status >= 500) {
          throw new Error('server');
        }
        throw new Error(data.error || 'github_failed');
      }

      // Success: Set repository URL and details
      setRepositoryUrl(data.repository.htmlUrl);
      setRepositoryName(data.repository.name);
      setRepositoryDescription(config.description);
      // Store the repo URL in config for future use
      setGithubRepoUrl(data.repository.htmlUrl);
      setShowLoadingScreen(false);
      setIsGenerating(false);
      toast.success('Repository Created!', 'Your scaffold has been pushed to GitHub');
    } catch (err) {
      // Log error details for debugging
      // Requirements: 5.5
      console.error('Generation failed:', err);
      
      let errorType = 'generation_failed';
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorType = 'network';
        console.error('Network error details:', {
          message: err.message,
          stack: err.stack,
        });
      } else if (err instanceof Error) {
        errorType = err.message;
        console.error('Error details:', {
          type: errorType,
          message: err.message,
          stack: err.stack,
        });
      }
      
      // Show error state after failed generation
      // Requirements: 4.4, 5.1, 5.2, 5.3, 8.5
      setError(errorType);
      setShowLoadingScreen(false);
      setIsGenerating(false);
      toast.error('Generation Failed', errorType);
    }
  };



  return (
    <>
      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
      
      {/* UI Switcher Link - Only show during wizard phase */}
      {!repositoryUrl && !isGenerating && !showLoadingScreen && (
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
      {!repositoryUrl && !isGenerating && !showLoadingScreen && (
        <PixelArtWizard onGenerate={handleGenerate} />
      )}

      {/* Generation Loading Screen */}
      {showLoadingScreen && (
        <GenerationLoadingScreen projectName={config.projectName} />
      )}



      {/* GitHub Success State */}
      {repositoryUrl && !isGenerating && !showLoadingScreen && (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-20">
          <div className="w-full max-w-2xl space-y-6">
            {/* Success Header */}
            <div className="text-center mb-8">
              <h1 className="pixel-title text-white mb-2">Repository Created!</h1>
              <p className="pixel-subtitle text-gray-300">Your scaffold has been pushed to GitHub</p>
            </div>

            {/* GitHub Repository Details */}
            <div className="p-6 bg-green-900/20 border-2 border-green-500 rounded-lg space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={32} className="text-green-500 shrink-0 mt-1 animate-in zoom-in duration-300" />
                <div className="flex-1">
                  <p className="text-xl text-green-400 font-bold pixel-title mb-3">
                    🎉 Success!
                  </p>
                  
                  {/* Repository Name */}
                  {repositoryName && (
                    <div className="mb-3">
                      <p className="text-sm text-green-300/70 mb-1">Repository Name</p>
                      <p className="text-lg text-white font-semibold font-mono bg-green-950/30 px-3 py-2 rounded border border-green-700/50">
                        {repositoryName}
                      </p>
                    </div>
                  )}
                  
                  {/* Repository Description */}
                  {repositoryDescription && (
                    <div className="mb-3">
                      <p className="text-sm text-green-300/70 mb-1">Description</p>
                      <p className="text-base text-green-100 bg-green-950/30 px-3 py-2 rounded border border-green-700/50">
                        {repositoryDescription}
                      </p>
                    </div>
                  )}
                  
                  {/* Repository URL */}
                  <div>
                    <p className="text-sm text-green-300/70 mb-1">Repository URL</p>
                    <p className="text-sm text-green-200 font-mono bg-green-950/30 px-3 py-2 rounded border border-green-700/50 break-all">
                      {repositoryUrl}
                    </p>
                  </div>
                </div>
              </div>

              {/* View Repository Button */}
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-base hover:bg-green-700 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <ExternalLink size={20} />
                View Repository on GitHub
              </a>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-zinc-950 text-gray-500">next steps</span>
              </div>
            </div>

            {/* View Deployment Guides */}
            <Link
              href={`/guides?repoUrl=${encodeURIComponent(repositoryUrl)}`}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium text-base hover:bg-purple-700 active:bg-purple-800 transition-all"
            >
              <BookOpen size={20} />
              <div className="flex flex-col items-start">
                <span>View Deployment Guides</span>
                <span className="text-xs text-purple-200 font-normal">Step-by-step instructions for any platform</span>
              </div>
            </Link>

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

            {/* Create Another Button */}
            <button
              onClick={() => {
                setRepositoryUrl(null);
                setRepositoryName(null);
                setRepositoryDescription(null);
                setError(null);
                setGithubRepoUrl(undefined);
              }}
              className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg font-medium text-base hover:bg-gray-700 active:bg-gray-900 transition-all border border-gray-700"
            >
              Create Another
            </button>
          </div>
        </div>
      )}

      {/* Error State - Show when generation fails */}
      {error && !repositoryUrl && !isGenerating && !showLoadingScreen && (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-20">
          <div className="w-full max-w-2xl">
            <ErrorMessage
              title={
                error === 'github_auth'
                  ? ERROR_MESSAGES.GITHUB_AUTH_ERROR.title
                  : error === 'github_conflict'
                  ? ERROR_MESSAGES.GITHUB_CONFLICT_ERROR.title
                  : error === 'github_rate_limit'
                  ? ERROR_MESSAGES.GITHUB_RATE_LIMIT_ERROR.title
                  : error === 'github_failed'
                  ? ERROR_MESSAGES.GITHUB_FAILED.title
                  : error === 'network'
                  ? ERROR_MESSAGES.NETWORK_ERROR.title
                  : error === 'timeout'
                  ? ERROR_MESSAGES.TIMEOUT_ERROR.title
                  : error === 'server'
                  ? ERROR_MESSAGES.SERVER_ERROR.title
                  : error === 'invalid_config'
                  ? ERROR_MESSAGES.INVALID_CONFIG.title
                  : ERROR_MESSAGES.GENERATION_FAILED.title
              }
              message={
                error === 'github_auth'
                  ? ERROR_MESSAGES.GITHUB_AUTH_ERROR.message
                  : error === 'github_conflict'
                  ? ERROR_MESSAGES.GITHUB_CONFLICT_ERROR.message
                  : error === 'github_rate_limit'
                  ? ERROR_MESSAGES.GITHUB_RATE_LIMIT_ERROR.message
                  : error === 'github_failed'
                  ? ERROR_MESSAGES.GITHUB_FAILED.message
                  : error === 'network'
                  ? ERROR_MESSAGES.NETWORK_ERROR.message
                  : error === 'timeout'
                  ? ERROR_MESSAGES.TIMEOUT_ERROR.message
                  : error === 'server'
                  ? ERROR_MESSAGES.SERVER_ERROR.message
                  : error === 'invalid_config'
                  ? ERROR_MESSAGES.INVALID_CONFIG.message
                  : ERROR_MESSAGES.GENERATION_FAILED.message
              }
              suggestions={
                error === 'github_auth'
                  ? ERROR_MESSAGES.GITHUB_AUTH_ERROR.suggestions
                  : error === 'github_conflict'
                  ? ERROR_MESSAGES.GITHUB_CONFLICT_ERROR.suggestions
                  : error === 'github_rate_limit'
                  ? ERROR_MESSAGES.GITHUB_RATE_LIMIT_ERROR.suggestions
                  : error === 'github_failed'
                  ? ERROR_MESSAGES.GITHUB_FAILED.suggestions
                  : error === 'network'
                  ? ERROR_MESSAGES.NETWORK_ERROR.suggestions
                  : error === 'timeout'
                  ? ERROR_MESSAGES.TIMEOUT_ERROR.suggestions
                  : error === 'server'
                  ? ERROR_MESSAGES.SERVER_ERROR.suggestions
                  : error === 'invalid_config'
                  ? ERROR_MESSAGES.INVALID_CONFIG.suggestions
                  : ERROR_MESSAGES.GENERATION_FAILED.suggestions
              }
              onRetry={() => {
                setError(null);
                handleGenerate();
              }}
            />

            <button
              onClick={() => {
                setError(null);
              }}
              className="w-full px-6 py-2 mt-4 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Back to Wizard
            </button>
          </div>
        </div>
      )}




    </>
  );
}
