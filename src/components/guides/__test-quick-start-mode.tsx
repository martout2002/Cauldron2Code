/**
 * Quick Start Mode Test Component
 * 
 * This component demonstrates and tests the Quick Start mode functionality
 * for deployment guides.
 * 
 * Test Cases:
 * 1. View mode toggle switches between quick-start and detailed
 * 2. Quick start mode hides descriptions, notes, warnings, and external links
 * 3. "Learn more" button appears in quick start mode
 * 4. Clicking "Learn more" shows hidden details
 * 5. View mode preference is persisted
 * 6. Commands and code snippets are always visible
 * 7. Substep descriptions are hidden in quick start mode
 */

'use client';

import { useState } from 'react';
import { GuideStep } from './GuideStep';
import { ViewModeToggle } from './ViewModeToggle';
import type { DeploymentStep } from '../../types/deployment-guides';

export function QuickStartModeTest() {
  const [viewMode, setViewMode] = useState<'quick-start' | 'detailed'>('detailed');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Sample step with all features
  const sampleStep: DeploymentStep = {
    id: 'test-step-1',
    title: 'Install and Configure CLI',
    description: 'This is a detailed description that should be hidden in quick start mode. It provides context and background information for the step.',
    order: 1,
    required: true,
    commands: [
      {
        id: 'cmd-1',
        command: 'npm install -g vercel',
        description: 'Install the Vercel CLI globally',
        language: 'bash',
      },
      {
        id: 'cmd-2',
        command: 'vercel login',
        description: 'Authenticate with your Vercel account',
        language: 'bash',
      },
    ],
    substeps: [
      {
        id: 'substep-1',
        title: 'Verify Installation',
        description: 'This substep description should also be hidden in quick start mode.',
        commands: [
          {
            id: 'substep-cmd-1',
            command: 'vercel --version',
            description: 'Check the installed version',
            language: 'bash',
          },
        ],
        externalLinks: [
          {
            text: 'Vercel CLI Documentation',
            url: 'https://vercel.com/docs/cli',
            type: 'documentation',
          },
        ],
      },
    ],
    notes: [
      'This is a helpful note that should be hidden in quick start mode.',
      'Notes provide additional context and tips for users.',
    ],
    warnings: [
      'This is a warning that should be hidden in quick start mode.',
      'Warnings alert users to potential issues.',
    ],
    externalLinks: [
      {
        text: 'Official Documentation',
        url: 'https://vercel.com/docs',
        type: 'documentation',
      },
    ],
  };

  const handleToggleStep = (stepId: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Start Mode Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This page demonstrates the Quick Start mode functionality. Toggle between modes
          to see how the guide adapts.
        </p>

        {/* View Mode Toggle */}
        <div className="mb-6">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>

        {/* Current Mode Indicator */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Current Mode: {viewMode === 'quick-start' ? 'Quick Start' : 'Detailed Guide'}
          </h2>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {viewMode === 'quick-start' ? (
              <>
                <strong>Quick Start Mode:</strong> Shows only essential commands and configuration.
                Descriptions, notes, warnings, and external links are hidden by default.
                Click "Learn more" on any step to expand details.
              </>
            ) : (
              <>
                <strong>Detailed Guide Mode:</strong> Shows full explanations, context,
                troubleshooting information, notes, warnings, and external links.
              </>
            )}
          </p>
        </div>

        {/* Test Checklist */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Test Checklist
          </h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>View mode toggle switches between quick-start and detailed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>Quick start mode hides step descriptions by default</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>Quick start mode hides notes and warnings by default</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>Quick start mode hides external links by default</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>"Learn more" button appears in quick start mode</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>Clicking "Learn more" shows hidden details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>Commands and code snippets are always visible</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>Substep descriptions are hidden in quick start mode</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>View mode preference is persisted in localStorage</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sample Step */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Sample Deployment Step
        </h2>
        <GuideStep
          step={sampleStep}
          completed={completedSteps.includes(sampleStep.id)}
          viewMode={viewMode}
          onToggleComplete={() => handleToggleStep(sampleStep.id)}
          guideId="test-guide"
        />
      </div>

      {/* Expected Behavior */}
      <div className="p-6 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Expected Behavior
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Quick Start Mode
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Step title and order are always visible</li>
              <li>Step description is hidden by default</li>
              <li>Commands are always visible with copy buttons</li>
              <li>"Learn more" button appears if step has hidden content</li>
              <li>Clicking "Learn more" reveals descriptions, notes, warnings, and links</li>
              <li>Button changes to "Hide details" when details are shown</li>
              <li>Substep titles and commands are visible</li>
              <li>Substep descriptions and links are hidden by default</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Detailed Guide Mode
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>All content is visible by default</li>
              <li>Step descriptions, notes, warnings, and links are shown</li>
              <li>Substep descriptions and links are shown</li>
              <li>No "Learn more" button appears</li>
              <li>Full context and explanations are provided</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Persistence
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>View mode preference is saved to localStorage</li>
              <li>Refreshing the page maintains the selected view mode</li>
              <li>Step completion status is persisted</li>
              <li>Expand/collapse state is persisted per step</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
