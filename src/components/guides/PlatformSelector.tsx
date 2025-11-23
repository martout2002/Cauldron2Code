'use client';

import { useState } from 'react';
import { ArrowRight, GitCompare } from 'lucide-react';
import { PlatformCard } from './PlatformCard';
import { PlatformComparison } from './PlatformComparison';
import { PLATFORMS, getRecommendedPlatforms } from '@/lib/deployment/platforms';
import type { Platform } from '@/types/deployment-guides';
import type { ScaffoldConfig } from '@/types';

interface PlatformSelectorProps {
  onSelectPlatform: (platform: Platform) => void;
  scaffoldConfig?: ScaffoldConfig;
  className?: string;
}

export function PlatformSelector({
  onSelectPlatform,
  scaffoldConfig,
  className = '',
}: PlatformSelectorProps) {
  const [showComparison, setShowComparison] = useState(false);

  // Get recommended platforms based on scaffold config
  const recommendedPlatforms = scaffoldConfig
    ? getRecommendedPlatforms(scaffoldConfig)
    : [];
  const recommendedIds = new Set(recommendedPlatforms.map((p) => p.id));

  if (showComparison) {
    return (
      <PlatformComparison
        onBack={() => setShowComparison(false)}
        onSelectPlatform={onSelectPlatform}
        scaffoldConfig={scaffoldConfig}
      />
    );
  }

  return (
    <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className}`} role="main">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Deployment Platform
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Select a hosting platform to get step-by-step deployment instructions tailored to your project
        </p>

        {/* Compare Platforms Button */}
        <button
          onClick={() => setShowComparison(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-label="Compare all deployment platforms"
        >
          <GitCompare size={20} aria-hidden="true" />
          Compare All Platforms
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </header>

      {/* Recommended Section */}
      {recommendedPlatforms.length > 0 && (
        <section className="mb-12" aria-labelledby="recommended-platforms-heading">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" aria-hidden="true" />
            <h2 id="recommended-platforms-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
              Recommended for Your Project
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Recommended deployment platforms">
            {recommendedPlatforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                onClick={() => onSelectPlatform(platform)}
                isRecommended={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Platforms Section */}
      <section aria-labelledby="all-platforms-heading">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-1 w-12 bg-gray-300 dark:bg-zinc-700 rounded-full" aria-hidden="true" />
          <h2 id="all-platforms-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
            All Platforms
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="All available deployment platforms">
          {PLATFORMS.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              onClick={() => onSelectPlatform(platform)}
              isRecommended={recommendedIds.has(platform.id)}
            />
          ))}
        </div>
      </section>

      {/* Help Text */}
      <aside className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl" aria-labelledby="platform-help-heading">
        <h3 id="platform-help-heading" className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Not sure which platform to choose?
        </h3>
        <p className="text-blue-800 dark:text-blue-200 mb-4">
          Each platform has its strengths. Click "Compare All Platforms" above to see a detailed comparison
          of features, pricing, and capabilities to help you make the best choice for your project.
        </p>
        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
            <span><strong>Vercel:</strong> Best for Next.js and frontend frameworks with excellent DX</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
            <span><strong>Railway:</strong> Great for full-stack apps with built-in database support</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
            <span><strong>Render:</strong> Simple deployments with generous free tier</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
            <span><strong>Netlify:</strong> Perfect for static sites and JAMstack applications</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
            <span><strong>AWS Amplify:</strong> Ideal if you're already using AWS services</span>
          </li>
        </ul>
      </aside>
    </main>
  );
}
