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
    <main className={`deployment-guide-halloween max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className}`} role="main" aria-label="Deployment platform selection">
      {/* Skip to content link for keyboard navigation */}
      <a 
        href="#platform-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#b4ff64] focus:text-[#0a0e1a] focus:font-[family-name:var(--font-pixelify)] focus:rounded-lg focus:shadow-lg"
      >
        Skip to platform selection
      </a>
      
      {/* Header */}
      <header className="text-center mb-12" id="platform-content">
        <h1 className="text-4xl sm:text-5xl font-[family-name:var(--font-pixelify)] font-bold text-white mb-4 text-shadow-[4px_4px_0px_rgba(0,0,0,0.8)]">
          Choose Your Deployment Platform
        </h1>
        <p className="text-lg font-[family-name:var(--font-pixelify)] text-gray-300 max-w-2xl mx-auto mb-8">
          Select a hosting platform to get step-by-step deployment instructions tailored to your project
        </p>

        {/* Compare Platforms Button */}
        <button
          onClick={() => setShowComparison(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#b4ff64] text-[#0a0e1a] font-[family-name:var(--font-pixelify)] font-semibold rounded-lg border-3 border-[#8fcc4f] shadow-[0_4px_0_#6a9938,0_8px_20px_rgba(0,0,0,0.4)] hover:bg-[#c8ff82] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#6a9938,0_12px_24px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0_#6a9938,0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b4ff64] focus:ring-offset-2"
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
            <div className="h-1 w-12 bg-gradient-to-r from-[#8b5cf6] via-[#b4ff64] to-[#f97316] rounded-full" aria-hidden="true" />
            <h2 id="recommended-platforms-heading" className="text-2xl font-[family-name:var(--font-pixelify)] font-bold text-white">
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
          <div className="h-1 w-12 bg-gradient-to-r from-[#6a9938] to-[#8fcc4f] rounded-full" aria-hidden="true" />
          <h2 id="all-platforms-heading" className="text-2xl font-[family-name:var(--font-pixelify)] font-bold text-white">
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
      <aside className="mt-12 p-6 bg-[rgba(20,20,30,0.8)] border-3 border-[#8b5cf6] rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)]" aria-labelledby="platform-help-heading">
        <h3 id="platform-help-heading" className="text-lg font-[family-name:var(--font-pixelify)] font-semibold text-[#b4ff64] mb-2">
          Not sure which platform to choose?
        </h3>
        <p className="text-gray-300 font-[family-name:var(--font-pixelify)] mb-4">
          Each platform has its strengths. Click "Compare All Platforms" above to see a detailed comparison
          of features, pricing, and capabilities to help you make the best choice for your project.
        </p>
        <ul className="space-y-2 text-sm text-gray-300 font-[family-name:var(--font-pixelify)]">
          <li className="flex items-start gap-2">
            <span className="text-[#b4ff64] mt-0.5">✦</span>
            <span><strong className="text-[#b4ff64]">Vercel:</strong> Best for Next.js and frontend frameworks with excellent DX</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#b4ff64] mt-0.5">✦</span>
            <span><strong className="text-[#b4ff64]">Railway:</strong> Great for full-stack apps with built-in database support</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#b4ff64] mt-0.5">✦</span>
            <span><strong className="text-[#b4ff64]">Render:</strong> Simple deployments with generous free tier</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#b4ff64] mt-0.5">✦</span>
            <span><strong className="text-[#b4ff64]">Netlify:</strong> Perfect for static sites and JAMstack applications</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#b4ff64] mt-0.5">✦</span>
            <span><strong className="text-[#b4ff64]">AWS Amplify:</strong> Ideal if you're already using AWS services</span>
          </li>
        </ul>
      </aside>
      
      {/* CSS for accessibility enhancements */}
      <style jsx global>{`
        /* Enhanced focus visibility for Halloween theme */
        .deployment-guide-halloween button:focus-visible,
        .deployment-guide-halloween a:focus-visible {
          outline: 3px solid #b4ff64 !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 0 6px rgba(180, 255, 100, 0.3) !important;
        }
        
        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .deployment-guide-halloween * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .deployment-guide-halloween button:hover {
            transform: none !important;
          }
          
          .deployment-guide-halloween .animate-pulse {
            animation: none !important;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .deployment-guide-halloween button,
          .deployment-guide-halloween a {
            border: 2px solid currentColor !important;
          }
        }
      `}</style>
    </main>
  );
}
