'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ExternalLink, PartyPopper } from 'lucide-react';
import { CommandBlock } from './CommandBlock';
import type { ChecklistItem } from '@/types/deployment-guides';

interface ChecklistSectionProps {
  items: ChecklistItem[];
  completedItems: string[];
  onToggleItem: (itemId: string) => void;
}

export function ChecklistSection({ items, completedItems, onToggleItem }: ChecklistSectionProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate completion stats
  const requiredItems = items.filter((item) => item.required);
  const completedRequiredItems = requiredItems.filter((item) =>
    completedItems.includes(item.id)
  );
  const allRequiredComplete = requiredItems.length > 0 && 
    completedRequiredItems.length === requiredItems.length;

  // Show success message when all required items are complete
  useEffect(() => {
    if (allRequiredComplete) {
      setShowSuccess(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [allRequiredComplete]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-300 dark:border-zinc-700">
        <h2 id="checklist-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Post-Deployment Checklist
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Complete these tasks to ensure your application is fully configured and production-ready.
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {completedRequiredItems.length} of {requiredItems.length} required items complete
          </span>
          {items.filter((item) => !item.required).length > 0 && (
            <span className="text-gray-500 dark:text-gray-500">
              {items.filter((item) => !item.required && completedItems.includes(item.id)).length} of{' '}
              {items.filter((item) => !item.required).length} optional items complete
            </span>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div 
          className="px-6 py-4 bg-green-100 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center gap-3">
            <PartyPopper size={24} className="text-green-600 dark:text-green-400 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                All required tasks complete!
              </p>
              <p className="text-xs text-green-800 dark:text-green-300 mt-1">
                Your application is ready for production. Consider completing the optional tasks for an even better setup.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Items */}
      <div className="divide-y divide-gray-200 dark:divide-zinc-800" role="list" aria-label="Post-deployment checklist items">
        {items.map((item) => {
          const isCompleted = completedItems.includes(item.id);

          return (
            <div
              key={item.id}
              className={`p-6 transition-colors ${
                isCompleted ? 'bg-gray-50 dark:bg-zinc-800/50' : ''
              }`}
              role="listitem"
            >
              {/* Item Header */}
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => onToggleItem(item.id)}
                  className="mt-1 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  aria-label={isCompleted ? `Mark "${item.title}" as incomplete` : `Mark "${item.title}" as complete`}
                  aria-pressed={isCompleted}
                  role="checkbox"
                  aria-checked={isCompleted}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" aria-hidden="true" />
                  ) : (
                    <Circle size={24} className="text-gray-400 dark:text-gray-600" aria-hidden="true" />
                  )}
                </button>

                {/* Item Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3
                      className={`text-lg font-semibold ${
                        isCompleted
                          ? 'text-gray-500 dark:text-gray-500 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {item.required ? (
                      <span 
                        className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded"
                        role="status"
                        aria-label="This item is required"
                      >
                        Required
                      </span>
                    ) : (
                      <span 
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded"
                        role="status"
                        aria-label="This item is optional"
                      >
                        Optional
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p
                    className={`text-sm mb-4 ${
                      isCompleted
                        ? 'text-gray-500 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {item.description}
                  </p>

                  {/* Commands */}
                  {item.commands && item.commands.length > 0 && (
                    <div className="mb-4">
                      {item.commands.map((command) => (
                        <CommandBlock key={command.id} command={command} />
                      ))}
                    </div>
                  )}

                  {/* External Links */}
                  {item.externalLinks && item.externalLinks.length > 0 && (
                    <nav aria-label={`Resources for ${item.title}`}>
                      <div className="flex flex-wrap gap-3">
                        {item.externalLinks.map((link, index) => (
                          <a
                            key={index}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
