'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, ExternalLink, Activity, MessageCircle } from 'lucide-react';
import type { TroubleshootingSection as TroubleshootingSectionType } from '@/types/deployment-guides';

interface TroubleshootingSectionProps {
  troubleshooting: TroubleshootingSectionType;
}

export function TroubleshootingSection({ troubleshooting }: TroubleshootingSectionProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

  const toggleIssue = (index: number) => {
    setExpandedIssues((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!troubleshooting.commonIssues || troubleshooting.commonIssues.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-xl border-3 border-[#f97316] bg-[rgba(20,20,30,0.8)] overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.3)]">
      {/* Section Header */}
      <div className="px-6 py-4 bg-[rgba(40,40,50,0.9)] border-b-2 border-[#f97316]">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle size={28} className="text-[#f97316] shrink-0" aria-hidden="true" />
          <h2 id="troubleshooting-heading" className="text-2xl font-bold font-[family-name:var(--font-pixelify)] text-white">
            Common Issues & Troubleshooting
          </h2>
        </div>
        <p className="text-sm font-[family-name:var(--font-pixelify)] text-gray-300">
          Having trouble? Check these common issues and solutions before reaching out for help.
        </p>
      </div>

      {/* Common Issues */}
      <div className="divide-y divide-gray-200 dark:divide-zinc-800" role="list" aria-label="Common troubleshooting issues">
        {troubleshooting.commonIssues.map((issue, index) => {
          const isExpanded = expandedIssues.has(index);

          return (
            <div key={index} className="border-b border-gray-200 dark:border-zinc-800 last:border-b-0" role="listitem">
              {/* Issue Header - Clickable */}
              <button
                onClick={() => toggleIssue(index)}
                className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-[rgba(249,115,22,0.1)] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b4ff64] focus:ring-offset-2"
                aria-expanded={isExpanded}
                aria-controls={`issue-${index}-content`}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} troubleshooting for: ${issue.title}`}
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <AlertCircle
                    size={20}
                    className="shrink-0 text-[#f97316]"
                    aria-hidden="true"
                  />
                  <h3 id={`issue-${index}-title`} className="text-lg font-bold font-[family-name:var(--font-pixelify)] text-white">
                    {issue.title}
                  </h3>
                </div>
                <div className="shrink-0">
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  )}
                </div>
              </button>

              {/* Issue Content - Expandable */}
              {isExpanded && (
                <div 
                  id={`issue-${index}-content`} 
                  className="px-6 pb-6 space-y-4"
                  role="region"
                  aria-labelledby={`issue-${index}-title`}
                >
                  {/* Symptoms */}
                  {issue.symptoms && issue.symptoms.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold font-[family-name:var(--font-pixelify)] text-[#f97316] mb-2">
                        Symptoms
                      </h4>
                      <ul className="space-y-1">
                        {issue.symptoms.map((symptom, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-white flex items-start gap-2"
                          >
                            <span className="text-[#f97316] mt-1">•</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Causes */}
                  {issue.causes && issue.causes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold font-[family-name:var(--font-pixelify)] text-[#f97316] mb-2">
                        Possible Causes
                      </h4>
                      <ul className="space-y-1">
                        {issue.causes.map((cause, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-white flex items-start gap-2"
                          >
                            <span className="text-[#f97316] mt-1">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Solutions */}
                  {issue.solutions && issue.solutions.length > 0 && (
                    <div className="p-4 bg-[rgba(180,255,100,0.1)] border-2 border-[#b4ff64] rounded-lg">
                      <h4 className="text-sm font-bold font-[family-name:var(--font-pixelify)] text-[#b4ff64] mb-2">
                        Solutions
                      </h4>
                      <ol className="space-y-2">
                        {issue.solutions.map((solution, idx) => (
                          <li
                            key={idx}
                            className="text-sm font-[family-name:var(--font-pixelify)] text-gray-300 flex items-start gap-2"
                          >
                            <span className="font-semibold shrink-0">{idx + 1}.</span>
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Related Links */}
                  {issue.relatedLinks && issue.relatedLinks.length > 0 && (
                    <nav aria-label="Related documentation for this issue">
                      <h4 className="text-xs font-semibold text-[#b4ff64] uppercase mb-2">
                        Related Documentation
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {issue.relatedLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                            aria-label={`${link.text} (opens in new tab)`}
                          >
                            {link.text}
                            <ExternalLink size={14} aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    </nav>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Resources Footer */}
      <nav className="px-6 py-4 bg-gray-50 dark:bg-zinc-800 border-t border-gray-300 dark:border-zinc-700" aria-label="Additional help resources">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Still need help?
        </h3>
        <div className="flex flex-wrap gap-4">
          {/* Platform Status */}
          {troubleshooting.platformStatusUrl && (
            <a
              href={troubleshooting.platformStatusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Check platform status (opens in new tab)"
            >
              <Activity size={16} className="text-green-600 dark:text-green-400" aria-hidden="true" />
              <span className="text-gray-900 dark:text-white">Check Platform Status</span>
              <ExternalLink size={14} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
            </a>
          )}

          {/* Community Links */}
          {troubleshooting.communityLinks && troubleshooting.communityLinks.length > 0 && (
            <>
              {troubleshooting.communityLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={`${link.text} (opens in new tab)`}
                >
                  <MessageCircle size={16} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span className="text-gray-900 dark:text-white">{link.text}</span>
                  <ExternalLink size={14} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
                </a>
              ))}
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
