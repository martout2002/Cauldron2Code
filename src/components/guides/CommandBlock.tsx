'use client';

import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import type { CommandSnippet } from '@/types/deployment-guides';

interface CommandBlockProps {
  command: CommandSnippet;
}

export function CommandBlock({ command }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy command:', error);
    }
  };

  // Highlight placeholders in the command
  const renderCommandWithHighlights = () => {
    if (!command.placeholders || command.placeholders.length === 0) {
      return <span>{command.command}</span>;
    }

    let result = command.command;
    const parts: { text: string; isPlaceholder: boolean }[] = [];
    let lastIndex = 0;

    // Find and mark all placeholders
    command.placeholders.forEach((placeholder) => {
      const index = result.indexOf(placeholder.key, lastIndex);
      if (index !== -1) {
        // Add text before placeholder
        if (index > lastIndex) {
          parts.push({
            text: result.substring(lastIndex, index),
            isPlaceholder: false,
          });
        }
        // Add placeholder
        parts.push({
          text: placeholder.key,
          isPlaceholder: true,
        });
        lastIndex = index + placeholder.key.length;
      }
    });

    // Add remaining text
    if (lastIndex < result.length) {
      parts.push({
        text: result.substring(lastIndex),
        isPlaceholder: false,
      });
    }

    return (
      <>
        {parts.map((part, index) => (
          <span
            key={index}
            className={
              part.isPlaceholder
                ? 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200 px-1 rounded font-semibold'
                : ''
            }
          >
            {part.text}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="my-4 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 overflow-hidden">
      {/* Command Description */}
      {command.description && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 border-b border-gray-300 dark:border-zinc-700">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Terminal size={14} className="shrink-0" />
            <span>{command.description}</span>
          </div>
        </div>
      )}

      {/* Command Code Block */}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-900 dark:text-gray-100">
          <code>{renderCommandWithHighlights()}</code>
        </pre>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-md bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={copied ? 'Copied!' : 'Copy command'}
          title={copied ? 'Copied!' : 'Copy command'}
        >
          {copied ? (
            <Check size={16} className="text-green-600 dark:text-green-400" />
          ) : (
            <Copy size={16} className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Placeholder Instructions */}
      {command.placeholders && command.placeholders.length > 0 && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
            Replace the following placeholders:
          </p>
          <ul className="space-y-2">
            {command.placeholders.map((placeholder) => (
              <li key={placeholder.key} className="text-xs text-yellow-800 dark:text-yellow-300">
                <span className="font-mono font-semibold bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">
                  {placeholder.key}
                </span>
                {' - '}
                {placeholder.description}
                {placeholder.example && (
                  <span className="block mt-1 text-yellow-700 dark:text-yellow-400">
                    Example: <code className="font-mono">{placeholder.example}</code>
                  </span>
                )}
                {placeholder.actualValue && (
                  <span className="block mt-1 text-green-700 dark:text-green-400">
                    Your value: <code className="font-mono font-semibold">{placeholder.actualValue}</code>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
