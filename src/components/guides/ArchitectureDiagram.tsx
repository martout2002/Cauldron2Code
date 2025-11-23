'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';

interface ArchitectureDiagramProps {
  type: string;
  diagram: string;
  description: string;
  defaultExpanded?: boolean;
}

/**
 * ArchitectureDiagram Component
 * 
 * Displays Mermaid diagrams for visualizing deployment workflows and architectures.
 * Includes expand/collapse functionality and accessibility features.
 */
export function ArchitectureDiagram({
  type,
  diagram,
  description,
  defaultExpanded = false,
}: ArchitectureDiagramProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const title = type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Extract the mermaid code from the markdown code block
  const mermaidCode = diagram.replace(/```mermaid\n?/, '').replace(/\n?```$/, '');

  return (
    <div className="my-6 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} diagram`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
        )}
      </button>

      {/* Diagram Content */}
      {isExpanded && (
        <div className="p-6 bg-gray-50 dark:bg-zinc-950">
          <div className="relative">
            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="absolute top-2 right-2 z-10 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            >
              <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
            </button>

            {/* Mermaid Diagram */}
            <div
              className={`
                ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-zinc-900 p-8 overflow-auto' : ''}
                bg-white dark:bg-zinc-900 rounded-lg p-6 overflow-x-auto
              `}
            >
              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-4 right-4 px-4 py-2 bg-gray-200 dark:bg-zinc-800 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close fullscreen"
                >
                  Close
                </button>
              )}
              
              <div className="mermaid-diagram">
                <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
                  <code>{mermaidCode}</code>
                </pre>
              </div>

              {/* Accessibility: Text description of diagram */}
              <div className="sr-only" role="img" aria-label={`${title}: ${description}`}>
                {description}
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> This diagram shows the visual flow of the deployment process. 
              Follow the arrows to understand the sequence of steps.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DiagramSection Component
 * 
 * Renders multiple related diagrams in a section
 */
interface DiagramSectionProps {
  diagrams: Array<{
    type: string;
    diagram: string;
    description: string;
  }>;
  title?: string;
  description?: string;
}

export function DiagramSection({ diagrams, title, description }: DiagramSectionProps) {
  if (diagrams.length === 0) return null;

  return (
    <section className="my-8" aria-labelledby="diagrams-section">
      {title && (
        <div className="mb-6">
          <h2 id="diagrams-section" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {diagrams.map((diagram, index) => (
          <ArchitectureDiagram
            key={diagram.type}
            type={diagram.type}
            diagram={diagram.diagram}
            description={diagram.description}
            defaultExpanded={index === 0}
          />
        ))}
      </div>
    </section>
  );
}

