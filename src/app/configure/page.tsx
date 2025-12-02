'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PixelArtWizard } from '@/components/wizard/PixelArtWizard';
import { ToastContainer } from '@/components/Toast';
import { useConfigStore } from '@/lib/store/config-store';
import { useWizardStore } from '@/lib/wizard/wizard-state';
import { useValidation } from '@/lib/validation/useValidation';
import { useToast } from '@/lib/hooks/useToast';
import { GenerationLoadingScreen } from '@/components/GenerationLoadingScreen';
import { ErrorMessage, ERROR_MESSAGES } from '@/components/ErrorMessage';
import { sanitizeRepoName } from '@/lib/github/repo-name-sanitizer';
import { ExternalLink, Settings, BookOpen } from 'lucide-react';
import { WizardBackground } from '@/components/wizard/WizardBackground';

export default function ConfigurePage() {
  const { config, setGithubRepoUrl, resetConfig } = useConfigStore();
  const { resetWizard } = useWizardStore();
  
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
      console.error('❌ Configuration validation failed:', validationResult.errors);
      console.log('📋 Current config:', config);
      toast.error('Configuration Invalid', `Please fix all errors before generating: ${validationResult.errors.map(e => e.message).join(', ')}`);
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
        <div className="relative h-screen flex items-center justify-center px-4 overflow-hidden">
          {/* Dark Wizard Background */}
          <WizardBackground />
          
          {/* Fixed Cauldron & Sparkles in Background - Matches wizard alignment */}
          <div className="fixed inset-x-0 bottom-[5vh] flex justify-center pointer-events-none z-0">
            <div className="relative mr-4">
              {/* Completed Cauldron - NOT transparent */}
              <img
                src="/cauldron_stages.png"
                alt=""
                className="w-64"
                style={{ imageRendering: 'pixelated' }}
                aria-hidden="true"
              />
              
              {/* Sparkle Effects at Corners */}
              <img
                src="/sparkles.png"
                alt=""
                className="absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12"
                style={{ 
                  imageRendering: 'pixelated',
                  animation: 'sparkle-pulse 1.5s ease-in-out infinite',
                  animationDelay: '0s'
                }}
                aria-hidden="true"
              />
              <img
                src="/sparkles.png"
                alt=""
                className="absolute -top-4 -right-4 w-10 h-10 md:w-12 md:h-12"
                style={{ 
                  imageRendering: 'pixelated',
                  animation: 'sparkle-pulse 1.5s ease-in-out infinite',
                  animationDelay: '0.5s'
                }}
                aria-hidden="true"
              />
              <img
                src="/sparkles.png"
                alt=""
                className="absolute -bottom-4 -left-4 w-10 h-10 md:w-12 md:h-12"
                style={{ 
                  imageRendering: 'pixelated',
                  animation: 'sparkle-pulse 1.5s ease-in-out infinite',
                  animationDelay: '1s'
                }}
                aria-hidden="true"
              />
              <img
                src="/sparkles.png"
                alt=""
                className="absolute -bottom-4 -right-4 w-10 h-10 md:w-12 md:h-12"
                style={{ 
                  imageRendering: 'pixelated',
                  animation: 'sparkle-pulse 1.5s ease-in-out infinite',
                  animationDelay: '0.25s'
                }}
                aria-hidden="true"
              />
            </div>
          </div>
          
          {/* Content Container */}
          <div className="relative z-10 w-full max-w-2xl space-y-4">

            {/* Success Header */}
            <div className="text-center space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              <h2 
                className="font-(family-name:--font-pixelify) text-xl md:text-2xl font-bold text-white"
                style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8)' }}
              >
                Repository Created!
              </h2>
              <p 
                className="font-(family-name:--font-pixelify) text-sm text-gray-300"
                style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8)' }}
              >
                Your scaffold has been pushed to GitHub
              </p>
            </div>

            {/* GitHub Repository Details - Pixel Art Panel */}
            <div 
              className="p-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
              style={{ 
                background: 'rgba(20, 20, 20, 0.9)',
                border: '4px solid #4a5568',
                borderRadius: '0'
              }}
            >
              {/* Repository Name */}
              {repositoryName && (
                <div>
                  <p 
                    className="font-(family-name:--font-pixelify) text-xs text-gray-300 mb-1"
                    style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)' }}
                  >
                    Repository Name
                  </p>
                  <p 
                    className="font-(family-name:--font-pixelify) text-base text-white font-semibold px-3 py-1.5"
                    style={{ 
                      background: 'rgba(10, 10, 10, 0.5)',
                      border: '2px solid #4a5568',
                      borderRadius: '0',
                      textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    {repositoryName}
                  </p>
                </div>
              )}
              
              {/* Repository Description */}
              {repositoryDescription && (
                <div>
                  <p 
                    className="font-(family-name:--font-pixelify) text-xs text-gray-300 mb-1"
                    style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)' }}
                  >
                    Description
                  </p>
                  <p 
                    className="font-(family-name:--font-pixelify) text-sm text-white px-3 py-1.5"
                    style={{ 
                      background: 'rgba(10, 10, 10, 0.5)',
                      border: '2px solid #4a5568',
                      borderRadius: '0',
                      textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    {repositoryDescription}
                  </p>
                </div>
              )}
              
              {/* Repository URL */}
              <div>
                <p 
                  className="font-(family-name:--font-pixelify) text-xs text-gray-300 mb-1"
                  style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)' }}
                >
                  Repository URL
                </p>
                <p 
                  className="text-xs text-white font-mono px-3 py-1.5 break-all"
                  style={{ 
                    background: 'rgba(10, 10, 10, 0.5)',
                    border: '2px solid #4a5568',
                    borderRadius: '0'
                  }}
                >
                  {repositoryUrl}
                </p>
              </div>

              {/* View Repository Button */}
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-(family-name:--font-pixelify) flex items-center justify-center gap-2 w-full px-4 py-3 text-white font-semibold text-base transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                style={{ 
                  background: '#10b981',
                  border: '3px solid #000',
                  borderRadius: '0',
                  textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
              >
                <ExternalLink size={18} />
                View Repository on GitHub
              </a>
            </div>

            {/* View Deployment Guides */}
            <Link
              href={`/guides?repoUrl=${encodeURIComponent(repositoryUrl)}`}
              className="font-(family-name:--font-pixelify) w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              style={{ 
                background: '#9333ea',
                border: '3px solid #000',
                borderRadius: '0',
                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#7e22ce'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#9333ea'}
            >
              <BookOpen size={18} />
              <span>View Deployment Guides</span>
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
                // Reset all local state
                setRepositoryUrl(null);
                setRepositoryName(null);
                setRepositoryDescription(null);
                setError(null);
                // Reset all persisted configuration data
                resetConfig();
                // Reset wizard to first step
                resetWizard();
              }}
              className="font-(family-name:--font-pixelify) w-full px-4 py-2.5 text-white font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              style={{ 
                background: '#374151',
                border: '3px solid #000',
                borderRadius: '0',
                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#374151'}
            >
              Create Another
            </button>
          </div>
          
          {/* Sparkle animation styles */}
          <style jsx>{`
            @keyframes sparkle-pulse {
              0%, 100% {
                transform: scale(1);
                opacity: 0.6;
              }
              50% {
                transform: scale(1.1);
                opacity: 1;
              }
            }
          `}</style>
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
