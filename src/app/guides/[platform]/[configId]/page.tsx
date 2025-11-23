'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { DeploymentGuide } from '@/components/guides';
import { GuideGenerator } from '@/lib/deployment/guide-generator';
import { getPlatformById } from '@/lib/deployment/platforms';
import { getConfigById } from '@/lib/deployment/guide-url-generator';
import { useConfigStore } from '@/lib/store/config-store';
import { getGuideErrorHandler, type GuideError } from '@/lib/deployment/guide-error-handler';
import type { DeploymentGuide as DeploymentGuideType } from '@/types/deployment-guides';

/**
 * Deployment Guide Page
 * 
 * Displays a comprehensive, step-by-step deployment guide for a specific
 * platform and scaffold configuration. Handles URL parameters to load
 * the appropriate guide and gracefully handles invalid configurations.
 * 
 * Requirements: 10.1, 10.2
 */
export default function DeploymentGuidePage() {
  const params = useParams();
  const { config: currentConfig } = useConfigStore();
  const errorHandler = getGuideErrorHandler();
  
  const [guide, setGuide] = useState<DeploymentGuideType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<GuideError | null>(null);

  useEffect(() => {
    loadGuide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.platform, params.configId]);

  /**
   * Load and generate the deployment guide
   * 
   * Requirement 10.1: Provide unique URL for deployment guide
   * Requirement 10.2: Bookmarked/shared URL displays same guide
   * Requirement 1.6: Pass repository URL to guide generator
   */
  const loadGuide = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Extract platform and configId from URL params
      const platformId = params.platform as string;
      const configId = params.configId as string;

      // Validate platform
      const platform = getPlatformById(platformId);
      if (!platform) {
        const guideError = errorHandler.handleInvalidUrlParams('platform', platformId);
        errorHandler.logError(guideError, { platform: platformId });
        setError(guideError);
        setIsLoading(false);
        return;
      }

      // Load scaffold config from storage or fall back to current config
      let scaffoldConfig = getConfigById(configId);
      
      // If config not found in storage, try using current config from store
      if (!scaffoldConfig) {
        console.warn(`Config ${configId} not found in storage, using current config`);
        scaffoldConfig = currentConfig;
        
        // If current config is also empty/invalid, show error
        if (!scaffoldConfig.projectName) {
          const guideError = errorHandler.handleInvalidUrlParams('configId', configId);
          errorHandler.logError(guideError, { configId });
          setError(guideError);
          setIsLoading(false);
          return;
        }
      }

      // Extract repository URL from query params
      let repoUrl: string | null = null;
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlRepoUrl = urlParams.get('repoUrl');
        if (urlRepoUrl) {
          repoUrl = decodeURIComponent(urlRepoUrl);
        }
      }

      // Generate the deployment guide with repository URL if available
      const generator = new GuideGenerator();
      const deploymentGuide = generator.generateGuide(platform, scaffoldConfig, repoUrl);

      setGuide(deploymentGuide);
    } catch (err) {
      const guideError = errorHandler.handleGenerationError(
        err as Error,
        { platform: params.platform as string, configId: params.configId as string }
      );
      errorHandler.logError(guideError, {
        platform: params.platform as string,
        configId: params.configId as string,
      });
      setError(guideError);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Generating Your Deployment Guide
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing your configuration and preparing step-by-step instructions...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !guide) {
    const errorMessage = error ? errorHandler.getUserMessage(error) : 'An unexpected error occurred while loading the deployment guide.';
    const suggestions = error ? errorHandler.getSuggestions(error) : [];
    const fallbackAction = error ? errorHandler.getFallbackAction(error) : 'selector';

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Unable to Load Guide
              </h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {errorMessage}
            </p>

            {suggestions.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Suggestions:
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              {fallbackAction === 'selector' && (
                <Link
                  href="/guides"
                  className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-colors"
                >
                  Back to Platform Selector
                </Link>
              )}
              
              {(fallbackAction === 'download' || fallbackAction === 'github') && (
                <Link
                  href="/configure"
                  className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-colors"
                >
                  Generate New Scaffold
                </Link>
              )}
              
              <Link
                href="/configure"
                className="block w-full px-4 py-3 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-semibold rounded-lg text-center transition-colors"
              >
                Start Over
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render the guide
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Back Navigation */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Platform Selector</span>
          </Link>
        </div>
      </div>

      {/* Deployment Guide Component */}
      <DeploymentGuide guide={guide} />
    </div>
  );
}
