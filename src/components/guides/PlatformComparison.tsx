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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2"
        >
          <ArrowLeft size={20} />
          Back to Platform Selection
        </button>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Platform Comparison
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
          Compare features, pricing, and capabilities across all deployment platforms to find the best fit for your project
        </p>
      </div>

      {/* Comparison Table - Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-800">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700">
                Feature
              </th>
              {PLATFORMS.map((platform) => (
                <th
                  key={platform.id}
                  className="px-6 py-4 text-center border-b border-gray-200 dark:border-zinc-700 relative"
                >
                  <div className="flex flex-col items-center gap-2">
                    {recommendedIds.has(platform.id) && (
                      <div className="absolute -top-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
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
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {platform.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Free Tier */}
            <tr className="border-b border-gray-200 dark:border-zinc-800">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Free Tier
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center">
                  {platform.features.freeTier ? (
                    <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 mx-auto" />
                  ) : (
                    <XCircle size={20} className="text-red-600 dark:text-red-400 mx-auto" />
                  )}
                </td>
              ))}
            </tr>

            {/* Build Minutes */}
            <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Build Minutes/Credits
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                  {platform.features.buildMinutes}
                </td>
              ))}
            </tr>

            {/* Database Support */}
            <tr className="border-b border-gray-200 dark:border-zinc-800">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Database Support
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center">
                  {platform.features.databaseSupport ? (
                    <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 mx-auto" />
                  ) : (
                    <XCircle size={20} className="text-red-600 dark:text-red-400 mx-auto" />
                  )}
                </td>
              ))}
            </tr>

            {/* Custom Domains */}
            <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Custom Domains
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center">
                  {platform.features.customDomains ? (
                    <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 mx-auto" />
                  ) : (
                    <XCircle size={20} className="text-red-600 dark:text-red-400 mx-auto" />
                  )}
                </td>
              ))}
            </tr>

            {/* Ease of Use */}
            <tr className="border-b border-gray-200 dark:border-zinc-800">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Ease of Use
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                      platform.features.easeOfUse === 'beginner'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : platform.features.easeOfUse === 'intermediate'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {platform.features.easeOfUse.charAt(0).toUpperCase() + platform.features.easeOfUse.slice(1)}
                  </span>
                </td>
              ))}
            </tr>

            {/* Best For */}
            <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Best For
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {platform.bestFor.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md"
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
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Links
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4">
                  <div className="flex flex-col gap-2 items-center">
                    <a
                      href={platform.pricingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Pricing
                      <ExternalLink size={12} />
                    </a>
                    <a
                      href={platform.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Docs
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </td>
              ))}
            </tr>

            {/* Action Buttons */}
            <tr className="bg-gray-50 dark:bg-zinc-800">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                Select Platform
              </td>
              {PLATFORMS.map((platform) => (
                <td key={platform.id} className="px-6 py-4 text-center">
                  <button
                    onClick={() => onSelectPlatform(platform)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            className="bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 rounded-xl p-6 relative"
          >
            {/* Recommended Badge */}
            {recommendedIds.has(platform.id) && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                Recommended
              </div>
            )}

            {/* Platform Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-zinc-800">
              <Image
                src={platform.logo}
                alt={`${platform.name} logo`}
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {platform.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {platform.description}
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Tier</span>
                {platform.features.freeTier ? (
                  <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle size={20} className="text-red-600 dark:text-red-400" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Build Minutes</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{platform.features.buildMinutes}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database Support</span>
                {platform.features.databaseSupport ? (
                  <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle size={20} className="text-red-600 dark:text-red-400" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Domains</span>
                {platform.features.customDomains ? (
                  <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle size={20} className="text-red-600 dark:text-red-400" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ease of Use</span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    platform.features.easeOfUse === 'beginner'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : platform.features.easeOfUse === 'intermediate'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}
                >
                  {platform.features.easeOfUse.charAt(0).toUpperCase() + platform.features.easeOfUse.slice(1)}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Best For</span>
                <div className="flex flex-wrap gap-2">
                  {platform.bestFor.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md"
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
                className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Pricing
                <ExternalLink size={14} />
              </a>
              <a
                href={platform.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Docs
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Select Button */}
            <button
              onClick={() => onSelectPlatform(platform)}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Choose {platform.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
