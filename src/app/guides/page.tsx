'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { PlatformSelector } from '@/components/guides';
import { useConfigStore } from '@/lib/store/config-store';
import { cleanupOldConfigs, getConfigById, generateConfigId } from '@/lib/deployment';
import type { Platform } from '@/types/deployment-guides';
import type { ScaffoldConfig } from '@/types';

/**
 * Platform Selector Page
 * 
 * Displays available deployment platforms and allows users to select one
 * to view deployment instructions tailored to their scaffold configuration.
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.5
 */
function GuidesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { config: storeConfig } = useConfigStore();
  const [activeConfig, setActiveConfig] = useState<ScaffoldConfig>(storeConfig);
  const [configId, setConfigId] = useState<string | null>(null);
  const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null);

  // Clean up old configurations on mount
  useEffect(() => {
    cleanupOldConfigs();
  }, []);

  /**
   * Handle config context from URL or store
   * 
   * Requirement 1.4: Navigate to platform selector with config context
   * Requirement 1.5: Pass scaffold config to guides page
   * Requirement 1.6: Detect if user has already created GitHub repository
   */
  useEffect(() => {
    const urlConfigId = searchParams.get('configId');
    const urlRepoUrl = searchParams.get('repoUrl');
    
    // Store repository URL if provided
    if (urlRepoUrl) {
      setRepositoryUrl(decodeURIComponent(urlRepoUrl));
    }
    
    if (urlConfigId) {
      // Try to load config from the configId
      const loadedConfig = getConfigById(urlConfigId);
      
      if (loadedConfig) {
        setActiveConfig(loadedConfig);
        setConfigId(urlConfigId);
      } else {
        // If config not found, use store config and generate new ID
        const newConfigId = generateConfigId(storeConfig);
        setActiveConfig(storeConfig);
        setConfigId(newConfigId);
      }
    } else {
      // No configId in URL, use store config and generate new ID
      const newConfigId = generateConfigId(storeConfig);
      setActiveConfig(storeConfig);
      setConfigId(newConfigId);
    }
  }, [searchParams, storeConfig]);

  /**
   * Handle platform selection
   * 
   * Requirement 1.2: Display platform selector with available platforms
   * Requirement 1.4: Navigate to guide page on platform selection
   * Requirement 1.6: Pass repository URL to guide generator
   */
  const handleSelectPlatform = (platform: Platform) => {
    // Use the active config ID or generate a new one
    const finalConfigId = configId || generateConfigId(activeConfig);
    
    // Build URL with repository URL if available
    const baseUrl = `/guides/${platform.id}/${finalConfigId}`;
    const urlWithRepo = repositoryUrl 
      ? `${baseUrl}?repoUrl=${encodeURIComponent(repositoryUrl)}`
      : baseUrl;
    
    // Navigate to the deployment guide page
    router.push(urlWithRepo);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Page Title and Description */}
      <div className="sr-only">
        <h1>Deployment Guides</h1>
        <p>
          Choose a deployment platform to get step-by-step instructions for deploying your generated project.
        </p>
      </div>

      {/* Platform Selector Component */}
      <PlatformSelector 
        onSelectPlatform={handleSelectPlatform}
        scaffoldConfig={activeConfig}
      />
    </div>
  );
}

export default function GuidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-zinc-950" />}>
      <GuidesPageContent />
    </Suspense>
  );
}
