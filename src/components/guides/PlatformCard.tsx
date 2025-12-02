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
        className="group relative w-full p-6 bg-[rgba(20,20,30,0.8)] border-3 border-[#8fcc4f] rounded-xl hover:border-[#b4ff64] hover:shadow-[0_0_20px_rgba(180,255,100,0.4),0_8px_16px_rgba(0,0,0,0.4)] hover:scale-105 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-[#b4ff64] focus:ring-offset-2 hover:-translate-y-1 min-h-[44px] min-w-[44px]"
        aria-label={`View deployment guide for ${platform.name}. ${platform.description}. ${isRecommended ? 'Recommended for your project.' : ''}`}
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      >
      {/* Recommended Badge */}
      {isRecommended && (
        <div 
          className="absolute -top-3 -right-3 bg-gradient-to-r from-[#8b5cf6] to-[#b4ff64] text-[#0a0e1a] text-xs font-[family-name:var(--font-pixelify)] font-bold px-3 py-1 rounded-full shadow-[0_0_12px_rgba(180,255,100,0.6)] flex items-center gap-1 animate-pulse"
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
              <div className="w-12 h-12 bg-[rgba(40,40,50,0.8)] rounded-lg flex items-center justify-center border-2 border-[#8fcc4f]">
                <span className="text-xl font-bold font-[family-name:var(--font-pixelify)] text-[#b4ff64]">
                  {platform.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold font-[family-name:var(--font-pixelify)] text-white group-hover:text-[#b4ff64] transition-colors">
              {platform.name}
            </h3>
            <p className="text-sm font-[family-name:var(--font-pixelify)] text-gray-300">
              {platform.description}
            </p>
          </div>
        </div>

        {/* Best For Tags */}
        <div className="mb-4">
          <p className="text-xs font-semibold font-[family-name:var(--font-pixelify)] text-[#b4ff64] uppercase tracking-wide mb-2">
            Best for
          </p>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Best use cases">
            {platform.bestFor.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-[rgba(139,92,246,0.3)] border border-[#8b5cf6] text-[#c4b5fd] text-xs font-[family-name:var(--font-pixelify)] font-medium rounded-md"
                role="listitem"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-2 pt-4 border-t border-[#6a9938]" role="list" aria-label="Platform features">
          <div className="flex items-center gap-2 text-sm" role="listitem">
            {platform.features.freeTier ? (
              <>
                <CheckCircle2 size={16} className="text-[#b4ff64] shrink-0" aria-hidden="true" />
                <span className="font-[family-name:var(--font-pixelify)] text-gray-200">Free tier available</span>
              </>
            ) : (
              <>
                <Zap size={16} className="text-gray-500 shrink-0" aria-hidden="true" />
                <span className="font-[family-name:var(--font-pixelify)] text-gray-400">Paid plans only</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm" role="listitem">
            {platform.features.databaseSupport ? (
              <>
                <Database size={16} className="text-[#8b5cf6] shrink-0" aria-hidden="true" />
                <span className="font-[family-name:var(--font-pixelify)] text-gray-200">Database support</span>
              </>
            ) : (
              <>
                <Database size={16} className="text-gray-500 shrink-0" aria-hidden="true" />
                <span className="font-[family-name:var(--font-pixelify)] text-gray-400">No database support</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm" role="listitem">
            {platform.features.customDomains ? (
              <>
                <Globe size={16} className="text-[#8b5cf6] shrink-0" aria-hidden="true" />
                <span className="font-[family-name:var(--font-pixelify)] text-gray-200">Custom domains</span>
              </>
            ) : (
              <>
                <Globe size={16} className="text-gray-500 shrink-0" aria-hidden="true" />
                <span className="font-[family-name:var(--font-pixelify)] text-gray-400">No custom domains</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm" role="listitem">
            <Zap size={16} className="text-[#f97316] shrink-0" aria-hidden="true" />
            <span className="font-[family-name:var(--font-pixelify)] text-gray-200">
              {platform.features.buildMinutes}
            </span>
          </div>
        </div>

        {/* Ease of Use Badge */}
        <div className="mt-4 pt-4 border-t border-[#6a9938]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold font-[family-name:var(--font-pixelify)] text-[#b4ff64] uppercase tracking-wide">
              Ease of Use
            </span>
            <span
              className={`px-2 py-1 text-xs font-[family-name:var(--font-pixelify)] font-bold rounded-md ${
                platform.features.easeOfUse === 'beginner'
                  ? 'bg-[rgba(180,255,100,0.3)] border border-[#b4ff64] text-[#b4ff64]'
                  : platform.features.easeOfUse === 'intermediate'
                  ? 'bg-[rgba(251,191,36,0.3)] border border-[#fbbf24] text-[#fbbf24]'
                  : 'bg-[rgba(239,68,68,0.3)] border border-[#ef4444] text-[#ef4444]'
              }`}
              role="status"
              aria-label={`Ease of use: ${platform.features.easeOfUse}`}
            >
              {platform.features.easeOfUse.charAt(0).toUpperCase() + platform.features.easeOfUse.slice(1)}
            </span>
          </div>
        </div>
      </button>
      
      {/* CSS for reduced motion preference */}
      <style jsx>{`
        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          button {
            transition: none !important;
            transform: none !important;
          }
          button:hover {
            transform: none !important;
            animation: none !important;
          }
          .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </article>
  );
}
