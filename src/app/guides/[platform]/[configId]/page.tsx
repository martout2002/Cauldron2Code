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
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#1a1e2a] to-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#b4ff64] mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold font-[family-name:var(--font-pixelify)] text-white mb-2">
            Generating Your Deployment Guide
          </h2>
          <p className="font-[family-name:var(--font-pixelify)] text-gray-300">
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
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#1a1e2a] to-[#0a0e1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-[rgba(20,20,30,0.8)] rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] p-8 border-3 border-[#ef4444]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[rgba(239,68,68,0.2)] rounded-lg border-2 border-[#ef4444]">
                <AlertCircle className="w-6 h-6 text-[#ef4444]" />
              </div>
              <h2 className="text-xl font-bold font-[family-name:var(--font-pixelify)] text-white">
                Unable to Load Guide
              </h2>
            </div>
            
            <p className="font-[family-name:var(--font-pixelify)] text-gray-300 mb-4">
              {errorMessage}
            </p>

            {suggestions.length > 0 && (
              <div className="mb-6 p-4 bg-[rgba(40,40,50,0.8)] rounded-lg border border-[#8b5cf6]">
                <h3 className="text-sm font-semibold font-[family-name:var(--font-pixelify)] text-[#b4ff64] mb-2">
                  Suggestions:
                </h3>
                <ul className="text-sm font-[family-name:var(--font-pixelify)] text-gray-300 space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#b4ff64] mt-0.5">✦</span>
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
                  className="block w-full px-4 py-3 bg-[#b4ff64] hover:bg-[#c8ff82] text-[#0a0e1a] font-[family-name:var(--font-pixelify)] font-semibold rounded-lg text-center transition-all duration-200 border-3 border-[#8fcc4f] shadow-[0_4px_0_#6a9938] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#6a9938]"
                >
                  Back to Platform Selector
                </Link>
              )}
              
              {(fallbackAction === 'download' || fallbackAction === 'github') && (
                <Link
                  href="/configure"
                  className="block w-full px-4 py-3 bg-[#b4ff64] hover:bg-[#c8ff82] text-[#0a0e1a] font-[family-name:var(--font-pixelify)] font-semibold rounded-lg text-center transition-all duration-200 border-3 border-[#8fcc4f] shadow-[0_4px_0_#6a9938] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#6a9938]"
                >
                  Generate New Scaffold
                </Link>
              )}
              
              <Link
                href="/configure"
                className="block w-full px-4 py-3 bg-[rgba(40,40,50,0.8)] hover:bg-[rgba(50,50,60,0.8)] text-white font-[family-name:var(--font-pixelify)] font-semibold rounded-lg text-center transition-all duration-200 border-2 border-[#8b5cf6]"
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#1a1e2a] to-[#0a0e1a]">
      {/* Back Navigation */}
      <div className="bg-[rgba(20,20,30,0.8)] border-b-2 border-[#8b5cf6]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#b4ff64] text-[#0a0e1a] font-[family-name:var(--font-pixelify)] font-semibold rounded-lg border-3 border-[#8fcc4f] shadow-[0_4px_0_#6a9938] hover:bg-[#c8ff82] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#6a9938] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b4ff64] focus:ring-offset-2"
          >
            <ArrowLeft size={20} />
            <span>Back to Platform Selector</span>
          </Link>
        </div>
      </div>

      {/* Deployment Guide Component */}
      <DeploymentGuide guide={guide} />
    </div>
  );
}
