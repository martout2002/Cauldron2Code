'use client';

import Image from 'next/image';
import { CheckCircle2, Database, Globe, Zap } from 'lucide-react';
import type { Platform } from '@/types/deployment-guides';

interface PlatformCardProps {
  platform: Platform;
  onClick: () => void;
  isRecommended?: boolean;
}

export function PlatformCard({ platform, onClick, isRecommended = false }: PlatformCardProps) {
  return (
    <article role="listitem">
      <button
        onClick={onClick}
        className="group relative w-full p-6 bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:-translate-y-1"
        aria-label={`View deployment guide for ${platform.name}. ${platform.description}. ${isRecommended ? 'Recommended for your project.' : ''}`}
      >
      {/* Recommended Badge */}
      {isRecommended && (
        <div 
          className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1"
          role="status"
          aria-label="Recommended for your project"
        >
          <CheckCircle2 size={12} aria-hidden="true" />
          Recommended
        </div>
      )}

        {/* Platform Logo and Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-12 h-12 shrink-0">
            {platform.logo ? (
              <Image
                src={platform.logo}
                alt=""
                width={48}
                height={48}
                className="object-contain"
                aria-hidden="true"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-gray-500 dark:text-gray-400">
                  {platform.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {platform.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {platform.description}
            </p>
          </div>
        </div>

        {/* Best For Tags */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Best for
          </p>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Best use cases">
            {platform.bestFor.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md"
                role="listitem"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-zinc-800" role="list" aria-label="Platform features">
          <div className="flex items-center gap-2 text-sm" role="listitem">
            {platform.features.freeTier ? (
              <>
                <CheckCircle2 size={16} className="text-green-600 dark:text-green-400 shrink-0" aria-hidden="true" />
                <span className="text-gray-700 dark:text-gray-300">Free tier available</span>
              </>
            ) : (
              <>
                <Zap size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
                <span className="text-gray-500 dark:text-gray-400">Paid plans only</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm" role="listitem">
            {platform.features.databaseSupport ? (
              <>
                <Database size={16} className="text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
                <span className="text-gray-700 dark:text-gray-300">Database support</span>
              </>
            ) : (
              <>
                <Database size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
                <span className="text-gray-500 dark:text-gray-400">No database support</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm" role="listitem">
            {platform.features.customDomains ? (
              <>
                <Globe size={16} className="text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
                <span className="text-gray-700 dark:text-gray-300">Custom domains</span>
              </>
            ) : (
              <>
                <Globe size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
                <span className="text-gray-500 dark:text-gray-400">No custom domains</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm" role="listitem">
            <Zap size={16} className="text-orange-600 dark:text-orange-400 shrink-0" aria-hidden="true" />
            <span className="text-gray-700 dark:text-gray-300">
              {platform.features.buildMinutes}
            </span>
          </div>
        </div>

        {/* Ease of Use Badge */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Ease of Use
            </span>
            <span
              className={`px-2 py-1 text-xs font-bold rounded-md ${
                platform.features.easeOfUse === 'beginner'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : platform.features.easeOfUse === 'intermediate'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}
              role="status"
              aria-label={`Ease of use: ${platform.features.easeOfUse}`}
            >
              {platform.features.easeOfUse.charAt(0).toUpperCase() + platform.features.easeOfUse.slice(1)}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
