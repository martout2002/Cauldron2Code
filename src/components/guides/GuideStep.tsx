'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, AlertTriangle, Info, ExternalLink, BookOpen } from 'lucide-react';
import { CommandBlock } from './CommandBlock';
import { CodeBlock } from './CodeBlock';
import type { DeploymentStep } from '@/types/deployment-guides';

interface GuideStepProps {
  step: DeploymentStep;
  completed: boolean;
  viewMode: 'quick-start' | 'detailed';
  onToggleComplete: () => void;
  guideId: string;
}

export function GuideStep({ step, completed, viewMode, onToggleComplete, guideId }: GuideStepProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Load expanded state from localStorage
  useEffect(() => {
    const storageKey = `guide-step-expanded-${guideId}-${step.id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      setIsExpanded(stored === 'true');
    }
  }, [guideId, step.id]);

  // Reset showDetails when view mode changes
  useEffect(() => {
    if (viewMode === 'detailed') {
      setShowDetails(false);
    }
  }, [viewMode]);

  // Save expanded state to localStorage
  const handleToggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    const storageKey = `guide-step-expanded-${guideId}-${step.id}`;
    localStorage.setItem(storageKey, String(newExpanded));
  };

  // Toggle detailed view in quick start mode
  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // In quick-start mode, show condensed view
  const isQuickStart = viewMode === 'quick-start';
  const shouldShowDetails = !isQuickStart || showDetails;

  return (
    <article 
      className="mb-6 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden"
      role="listitem"
      aria-labelledby={`step-${step.id}-title`}
    >
      {/* Step Header */}
      <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-zinc-800">
        {/* Checkbox */}
        <button
          onClick={onToggleComplete}
          className="mt-1 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          aria-label={completed ? `Mark step ${step.order} as incomplete` : `Mark step ${step.order} as complete`}
          aria-pressed={completed}
          role="checkbox"
          aria-checked={completed}
        >
          {completed ? (
            <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" aria-hidden="true" />
          ) : (
            <Circle size={24} className="text-gray-400 dark:text-gray-600" aria-hidden="true" />
          )}
        </button>

        {/* Step Title and Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400" aria-label={`Step ${step.order}`}>
              Step {step.order}
            </span>
            {step.required && (
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase" role="status" aria-label="This step is required">
                Required
              </span>
            )}
          </div>
          <h3 id={`step-${step.id}-title`} className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>
          {shouldShowDetails && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {step.description}
            </p>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={handleToggleExpand}
          className="shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={isExpanded ? `Collapse step ${step.order}: ${step.title}` : `Expand step ${step.order}: ${step.title}`}
          aria-expanded={isExpanded}
          aria-controls={`step-${step.id}-content`}
        >
          {isExpanded ? (
            <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" aria-hidden="true" />
          ) : (
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Step Content */}
      {isExpanded && (
        <div id={`step-${step.id}-content`} className="p-4 space-y-4" role="region" aria-labelledby={`step-${step.id}-title`}>
          {/* Quick Start "Learn More" / "Hide Details" Button */}
          {isQuickStart && (step.notes || step.warnings || step.description) && (
            <button
              onClick={handleToggleDetails}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={showDetails ? "Hide detailed explanations and notes" : "Show detailed explanations and notes for this step"}
              aria-expanded={showDetails}
            >
              <BookOpen size={16} aria-hidden="true" />
              <span>{showDetails ? 'Hide details' : 'Learn more about this step'}</span>
            </button>
          )}

          {/* Warnings */}
          {shouldShowDetails && step.warnings && step.warnings.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                    Warning
                  </p>
                  <ul className="space-y-1">
                    {step.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-red-800 dark:text-red-300">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Commands */}
          {step.commands && step.commands.length > 0 && (
            <div>
              {step.commands.map((command) => (
                <CommandBlock key={command.id} command={command} />
              ))}
            </div>
          )}

          {/* Code Snippets */}
          {step.codeSnippets && step.codeSnippets.length > 0 && (
            <div>
              {step.codeSnippets.map((snippet) => (
                <CodeBlock key={snippet.id} snippet={snippet} />
              ))}
            </div>
          )}

          {/* Substeps */}
          {step.substeps && step.substeps.length > 0 && (
            <div className="ml-4 pl-4 border-l-2 border-gray-300 dark:border-zinc-700 space-y-4">
              {step.substeps.map((substep, index) => (
                <div key={substep.id} className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {step.order}.{index + 1} {substep.title}
                  </h4>
                  {shouldShowDetails && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {substep.description}
                    </p>
                  )}

                  {/* Substep Commands */}
                  {substep.commands && substep.commands.length > 0 && (
                    <div>
                      {substep.commands.map((command) => (
                        <CommandBlock key={command.id} command={command} />
                      ))}
                    </div>
                  )}

                  {/* Substep External Links */}
                  {shouldShowDetails && substep.externalLinks && substep.externalLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {substep.externalLinks.map((link, linkIndex) => (
                        <a
                          key={linkIndex}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                          aria-label={`${link.text} (opens in new tab)`}
                        >
                          {link.text}
                          <ExternalLink size={12} aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* External Links */}
          {shouldShowDetails && step.externalLinks && step.externalLinks.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                Additional Resources
              </p>
              <nav aria-label="Additional resources for this step">
                <div className="flex flex-wrap gap-3">
                  {step.externalLinks.map((link, index) => (
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
            </div>
          )}

          {/* Notes */}
          {shouldShowDetails && step.notes && step.notes.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={18} className="shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Notes
                  </p>
                  <ul className="space-y-1">
                    {step.notes.map((note, index) => (
                      <li key={index} className="text-sm text-blue-800 dark:text-blue-300">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
