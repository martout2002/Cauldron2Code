'use client';

import Image from 'next/image';
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, Star } from 'lucide-react';
import { PLATFORMS, getRecommendedPlatforms } from '@/lib/deployment/platforms';
import type { Platform } from '@/types/deployment-guides';
import type { ScaffoldConfig } from '@/types';

interface PlatformComparisonProps {
  onBack: () => void;
  onSelectPlatform: (platform: Platform) => void;
  scaffoldConfig?: ScaffoldConfig;
}

export function PlatformComparison({
  onBack,
  onSelectPlatform,
  scaffoldConfig,
}: PlatformComparisonProps) {
  // Get recommended platforms based on scaffold config
  const recommendedPlatforms = scaffoldConfig
    ? getRecommendedPlatforms(scaffoldConfig)
    : [];
  const recommendedIds = new Set(recommendedPlatforms.map((p) => p.id));

  return (
    <div className="deployment-guide-halloween max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" role="main" aria-label="Platform comparison">
      {/* Skip to comparison table */}
      <a 
        href="#comparison-table" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#b4ff64] focus:text-[#0a0e1a] focus:font-[family-name:var(--font-pixelify)] focus:rounded-lg focus:shadow-lg"
      >
        Skip to comparison table
      </a>
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#b4ff64] text-[#0a0e1a] font-[family-name:var(--font-pixelify)] font-semibold rounded-lg border-3 border-[#8fcc4f] shadow-[0_4px_0_#6a9938,0_8px_20px_rgba(0,0,0,0.4)] hover:bg-[#c8ff82] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#6a9938,0_12px_24px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0_#6a9938,0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b4ff64] focus:ring-offset-2 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Platform Selection
        </button>

        <h1 className="text-4xl sm:text-5xl font-[family-name:var(--font-pixelify)] font-bold text-white mb-4 text-shadow-[4px_4px_0px_rgba(0,0,0,0.8)]">
          Platform Comparison
        </h1>
        <p className="text-lg font-[family-name:var(--font-pixelify)] text-gray-300 max-w-3xl">
          Compare features, pricing, and capabilities across all deployment platforms to find the best fit for your project
        </p>
      </div>

      {/* Comparison Table - Desktop */}
      <div className="hidden lg:block overflow-x-auto" id="comparison-table">
        <table className="w-full border-collapse bg-[rgba(20,20,30,0.8)] rounded-xl overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.3)] border-3 border-[#8b5cf6]" role="table" aria-label="Platform feature comparison table">
          <thead>
            <tr className="bg-[rgba(40,40,50,0.9)]">
              <th className="px-6 py-4 text-left text-sm font-[family-name:var(--font-pixelify)] font-semibold text-[#b4ff64] border-b-2 border-[#8b5cf6]">
                Feature
              </th>
              {PLATFORMS.map((platform) => (
                <th
                  key={platform.id}
                  className="px-6 py-4 text-center border-b-2 border-[#8b5cf6] relative"
                >
                  <div className="flex flex-col items-center gap-2">
                    {recommendedIds.has(platform.id) && (
                      <div className="absolute -top-2 bg-gradient-to-r from-[#8b5cf6] to-[#b4ff64] text-[#0a0e1a] text-xs font-[family-name:var(--font-pixelify)] font-bold px-2 py-1 rounded-full shadow-[0_0_12px_rgba(180,255,100,0.6)] flex items-center gap-1 animate-pulse">
                        <Star size={10} fill="currentColor" />
                        Recommended
                      </div>
                    )}
                    <Image
                      src={platform.logo}
                      alt={`${platform.name} logo`}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                    <span className="text-sm font-[family-name:var(--font-pixelify)] font-semibold text-white">
                      {platform.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Free Tier */}
            <tr className="border-b border-[#6a9938]">
              <td className="px-6 py-4 text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">
                Free Tier
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center">
                  {platform.features.freeTier ? (
                    <CheckCircle2 size={20} className="text-[#b4ff64] mx-auto" aria-label="Yes" role="img" />
                  ) : (
                    <XCircle size={20} className="text-[#ef4444] mx-auto" aria-label="No" role="img" />
                  )}
                </td>
              ))}
            </tr>

            {/* Build Minutes */}
            <tr className="border-b border-[#6a9938] bg-[rgba(40,40,50,0.5)]">
              <td className="px-6 py-4 text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">
                Build Minutes/Credits
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center text-sm font-[family-name:var(--font-pixelify)] text-gray-300">
                  {platform.features.buildMinutes}
                </td>
              ))}
            </tr>

            {/* Database Support */}
            <tr className="border-b border-[#6a9938]">
              <td className="px-6 py-4 text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">
                Database Support
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center">
                  {platform.features.databaseSupport ? (
                    <CheckCircle2 size={20} className="text-[#b4ff64] mx-auto" aria-label="Yes" role="img" />
                  ) : (
                    <XCircle size={20} className="text-[#ef4444] mx-auto" aria-label="No" role="img" />
                  )}
                </td>
              ))}
            </tr>

            {/* Custom Domains */}
            <tr className="border-b border-[#6a9938] bg-[rgba(40,40,50,0.5)]">
              <td className="px-6 py-4 text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">
                Custom Domains
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center">
                  {platform.features.customDomains ? (
                    <CheckCircle2 size={20} className="text-[#b4ff64] mx-auto" aria-label="Yes" role="img" />
                  ) : (
                    <XCircle size={20} className="text-[#ef4444] mx-auto" aria-label="No" role="img" />
                  )}
                </td>
              ))}
            </tr>

            {/* Ease of Use */}
            <tr className="border-b border-[#6a9938]">
              <td className="px-6 py-4 text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">
                Ease of Use
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-[family-name:var(--font-pixelify)] font-bold rounded-md ${
                      platform.features.easeOfUse === 'beginner'
                        ? 'bg-[rgba(180,255,100,0.3)] border border-[#b4ff64] text-[#b4ff64]'
                        : platform.features.easeOfUse === 'intermediate'
                        ? 'bg-[rgba(251,191,36,0.3)] border border-[#fbbf24] text-[#fbbf24]'
                        : 'bg-[rgba(239,68,68,0.3)] border border-[#ef4444] text-[#ef4444]'
                    }`}
                  >
                    {platform.features.easeOfUse.charAt(0).toUpperCase() + platform.features.easeOfUse.slice(1)}
                  </span>
                </td>
              ))}
            </tr>

            {/* Best For */}
            <tr className="border-b border-[#6a9938] bg-[rgba(40,40,50,0.5)]">
              <td className="px-6 py-4 text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">
                Best For
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {platform.bestFor.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[rgba(139,92,246,0.3)] border border-[#8b5cf6] text-[#c4b5fd] text-xs font-[family-name:var(--font-pixelify)] font-medium rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Links */}
            <tr>
              <td className="px-6 py-4 text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">
                Links
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4">
                  <div className="flex flex-col gap-2 items-center">
                    <a
                      href={platform.pricingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-[family-name:var(--font-pixelify)] text-[#8b5cf6] hover:text-[#b4ff64] transition-colors"
                    >
                      Pricing
                      <ExternalLink size={12} />
                    </a>
                    <a
                      href={platform.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-[family-name:var(--font-pixelify)] text-[#8b5cf6] hover:text-[#b4ff64] transition-colors"
                    >
                      Docs
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </td>
              ))}
            </tr>

            {/* Action Buttons */}
            <tr className="bg-[rgba(40,40,50,0.9)]">
              <td className="px-6 py-4 text-sm font-[family-name:var(--font-pixelify)] font-medium text-[#b4ff64]">
                Select Platform
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center">
                  <button
                    onClick={() => onSelectPlatform(platform)}
                    className="px-4 py-2 bg-[#b4ff64] text-[#0a0e1a] text-sm font-[family-name:var(--font-pixelify)] font-semibold rounded-lg border-2 border-[#8fcc4f] shadow-[0_4px_0_#6a9938] hover:bg-[#c8ff82] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#6a9938] active:translate-y-0.5 active:shadow-[0_2px_0_#6a9938] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b4ff64] focus:ring-offset-2"
                  >
                    Choose
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comparison Cards - Mobile/Tablet */}
      <div className="lg:hidden space-y-6">
        {PLATFORMS.map((platform) => (
          <div
            key={platform.id}
            className="bg-[rgba(20,20,30,0.8)] border-3 border-[#8fcc4f] rounded-xl p-6 relative shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            {/* Recommended Badge */}
            {recommendedIds.has(platform.id) && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#8b5cf6] to-[#b4ff64] text-[#0a0e1a] text-xs font-[family-name:var(--font-pixelify)] font-bold px-3 py-1 rounded-full shadow-[0_0_12px_rgba(180,255,100,0.6)] flex items-center gap-1 animate-pulse">
                <Star size={12} fill="currentColor" />
                Recommended
              </div>
            )}

            {/* Platform Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-[#6a9938]">
              <Image
                src={platform.logo}
                alt={`${platform.name} logo`}
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <h3 className="text-xl font-[family-name:var(--font-pixelify)] font-bold text-white">
                  {platform.name}
                </h3>
                <p className="text-sm font-[family-name:var(--font-pixelify)] text-gray-300">
                  {platform.description}
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">Free Tier</span>
                {platform.features.freeTier ? (
                  <CheckCircle2 size={20} className="text-[#b4ff64]" aria-label="Yes" role="img" />
                ) : (
                  <XCircle size={20} className="text-[#ef4444]" aria-label="No" role="img" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">Build Minutes</span>
                <span className="text-sm font-[family-name:var(--font-pixelify)] text-gray-300">{platform.features.buildMinutes}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">Database Support</span>
                {platform.features.databaseSupport ? (
                  <CheckCircle2 size={20} className="text-[#b4ff64]" aria-label="Yes" role="img" />
                ) : (
                  <XCircle size={20} className="text-[#ef4444]" aria-label="No" role="img" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">Custom Domains</span>
                {platform.features.customDomains ? (
                  <CheckCircle2 size={20} className="text-[#b4ff64]" aria-label="Yes" role="img" />
                ) : (
                  <XCircle size={20} className="text-[#ef4444]" aria-label="No" role="img" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-[family-name:var(--font-pixelify)] font-medium text-white">Ease of Use</span>
                <span
                  className={`px-3 py-1 text-xs font-[family-name:var(--font-pixelify)] font-bold rounded-md ${
                    platform.features.easeOfUse === 'beginner'
                      ? 'bg-[rgba(180,255,100,0.3)] border border-[#b4ff64] text-[#b4ff64]'
                      : platform.features.easeOfUse === 'intermediate'
                      ? 'bg-[rgba(251,191,36,0.3)] border border-[#fbbf24] text-[#fbbf24]'
                      : 'bg-[rgba(239,68,68,0.3)] border border-[#ef4444] text-[#ef4444]'
                  }`}
                >
                  {platform.features.easeOfUse.charAt(0).toUpperCase() + platform.features.easeOfUse.slice(1)}
                </span>
              </div>

              <div>
                <span className="text-sm font-[family-name:var(--font-pixelify)] font-medium text-white block mb-2">Best For</span>
                <div className="flex flex-wrap gap-2">
                  {platform.bestFor.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-[rgba(139,92,246,0.3)] border border-[#8b5cf6] text-[#c4b5fd] text-xs font-[family-name:var(--font-pixelify)] font-medium rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-3 mb-4">
              <a
                href={platform.pricingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 border-2 border-[#8b5cf6] text-[#8b5cf6] text-sm font-[family-name:var(--font-pixelify)] font-medium rounded-lg hover:bg-[rgba(139,92,246,0.2)] hover:text-[#b4ff64] hover:border-[#b4ff64] transition-all duration-200 min-h-[44px]"
              >
                Pricing
                <ExternalLink size={14} />
              </a>
              <a
                href={platform.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 border-2 border-[#8b5cf6] text-[#8b5cf6] text-sm font-[family-name:var(--font-pixelify)] font-medium rounded-lg hover:bg-[rgba(139,92,246,0.2)] hover:text-[#b4ff64] hover:border-[#b4ff64] transition-all duration-200 min-h-[44px]"
              >
                Docs
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Select Button */}
            <button
              onClick={() => onSelectPlatform(platform)}
              className="w-full px-6 py-3 bg-[#b4ff64] text-[#0a0e1a] font-[family-name:var(--font-pixelify)] font-semibold rounded-lg border-3 border-[#8fcc4f] shadow-[0_4px_0_#6a9938] hover:bg-[#c8ff82] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#6a9938] active:translate-y-0.5 active:shadow-[0_2px_0_#6a9938] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b4ff64] focus:ring-offset-2 min-h-[44px]"
            >
              Choose {platform.name}
            </button>
          </div>
        ))}
      </div>
      
      {/* CSS for accessibility enhancements */}
      <style jsx global>{`
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
      `}</style>
    </div>
  );
}
