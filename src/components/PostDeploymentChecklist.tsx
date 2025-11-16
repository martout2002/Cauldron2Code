'use client';

/**
 * Post-Deployment Checklist Component
 * Displays setup tasks that need to be completed after deployment
 */

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from './Tooltip';
import type { Deployment } from '@/lib/platforms/types';
import {
  PostDeploymentChecklistGenerator,
  type ChecklistItem,
} from '@/lib/deployment';

interface PostDeploymentChecklistProps {
  deployment: Deployment;
}

export function PostDeploymentChecklist({
  deployment,
}: PostDeploymentChecklistProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Generate checklist items
  const generator = new PostDeploymentChecklistGenerator();
  const items = generator.generate(deployment);

  const toggleItem = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allRequiredComplete = items
    .filter((i) => i.required)
    .every((i) => completed.has(i.id));

  const copySetupInstructions = async () => {
    const instructions = items
      .map((item) => {
        let text = `${item.required ? '☐' : '○'} ${item.title}\n`;
        text += `  ${item.description}\n`;
        if (item.command) {
          text += `  Command: ${item.command}\n`;
        }
        if (item.links && item.links.length > 0) {
          text += `  Links:\n`;
          item.links.forEach((link) => {
            text += `    - ${link.text}: ${link.url}\n`;
          });
        }
        if (item.action) {
          text += `  Action: ${item.action.text} - ${item.action.url}\n`;
        }
        return text;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(instructions);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy instructions:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">Post-Deployment Setup</h2>
            <Tooltip content="These steps help you complete the setup of your deployed application. Required items must be completed for full functionality.">
              <Info size={18} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-gray-600">
            Complete these steps to finalize your deployment
          </p>
        </div>
        <Tooltip content="Copy all setup instructions to your clipboard for reference">
          <button
            onClick={copySetupInstructions}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy Instructions'}
          </button>
        </Tooltip>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            completed={completed.has(item.id)}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </div>

      {allRequiredComplete && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-800 mb-2">
                All required steps complete!
              </p>
              <p className="text-sm text-green-700 mb-4">
                Your application is ready to use. Visit your live site to see it
                in action.
              </p>
              <a
                href={deployment.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View Live Site
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChecklistItemCardProps {
  item: ChecklistItem;
  completed: boolean;
  onToggle: () => void;
}

function ChecklistItemCard({
  item,
  completed,
  onToggle,
}: ChecklistItemCardProps) {
  return (
    <div
      className={`p-4 border rounded-lg transition-all ${
        completed
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={completed}
          onChange={onToggle}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          id={`checklist-${item.id}`}
        />
        <div className="flex-1">
          <label
            htmlFor={`checklist-${item.id}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <h3
              className={`font-semibold ${
                completed ? 'text-green-800 line-through' : 'text-gray-900'
              }`}
            >
              {item.title}
            </h3>
            {item.required && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Required
              </span>
            )}
            {!item.required && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Optional
              </span>
            )}
          </label>

          <p className="text-sm text-gray-600 mt-1">{item.description}</p>

          {item.command && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Run this command:</p>
              <div className="relative group">
                <pre className="p-3 bg-gray-900 text-gray-100 rounded font-mono text-sm overflow-x-auto">
                  {item.command}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.command!);
                  }}
                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                  title="Copy command"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {item.links && item.links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {link.text}
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              ))}
            </div>
          )}

          {item.action && (
            <a
              href={item.action.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              {item.action.text}
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
