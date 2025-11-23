'use client';

import { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';
import type { CodeSnippet } from '@/types/deployment-guides';

interface CodeBlockProps {
  snippet: CodeSnippet;
}

export function CodeBlock({ snippet }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="my-4 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 overflow-hidden">
      {/* Header with Title/Filename */}
      {(snippet.title || snippet.filename) && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 border-b border-gray-300 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode size={14} className="shrink-0 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {snippet.filename || snippet.title}
              </span>
              {snippet.filename && snippet.title && snippet.filename !== snippet.title && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  - {snippet.title}
                </span>
              )}
            </div>
            {snippet.language && (
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400 uppercase">
                {snippet.language}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Code Content */}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-900 dark:text-gray-100">
          <code className={snippet.language ? `language-${snippet.language}` : ''}>
            {snippet.code}
          </code>
        </pre>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-md bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={copied ? 'Copied!' : 'Copy code'}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <Check size={16} className="text-green-600 dark:text-green-400" />
          ) : (
            <Copy size={16} className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Description */}
      {snippet.description && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            {snippet.description}
          </p>
        </div>
      )}
    </div>
  );
}
