/**
 * Manual test for OptionGrid accessibility attributes
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { OptionGrid } from './OptionGrid';

// Test data with disabled options
const testOptions = [
  {
    value: 'nextjs',
    label: 'Next.js',
    icon: '/icons/frameworks/nextjs.svg',
    description: 'React framework with SSR',
    isDisabled: false,
  },
  {
    value: 'express',
    label: 'Express',
    icon: '/icons/frameworks/express.svg',
    description: 'Fast, unopinionated web framework',
    isDisabled: true,
    incompatibilityReason: 'Express cannot be used with Next.js. Next.js has its own API routes.',
  },
  {
    value: 'react',
    label: 'React',
    icon: '/icons/frameworks/react.svg',
    description: 'A JavaScript library for building UIs',
    isDisabled: false,
  },
  {
    value: 'fastify',
    label: 'Fastify',
    icon: '/icons/frameworks/fastify.svg',
    description: 'Fast and low overhead web framework',
    isDisabled: true,
    incompatibilityReason: 'Fastify cannot be used with Next.js. Use Next.js API or select a different frontend.',
  },
];

export function TestAccessibilityAttributes() {
  const handleSelect = (value: string | string[]) => {
    console.log('Selected:', value);
  };

  return (
    <div className="p-8 bg-gray-800 min-h-screen">
      <h1 className="text-white text-2xl mb-8">OptionGrid Accessibility Attributes Test</h1>
      
      <div className="mb-8">
        <h2 className="text-white text-xl mb-4">Test Cases:</h2>
        <ul className="text-gray-300 space-y-2">
          <li>✓ Requirement 4.1: Disabled options have aria-disabled="true"</li>
          <li>✓ Requirement 4.2: Disabled options have aria-describedby linking to incompatibility message</li>
          <li>✓ Requirement 4.3: Disabled options remain focusable (tabIndex=0)</li>
          <li>✓ Requirement 4.3: Enter/Space on disabled options does NOT trigger selection</li>
          <li>✓ Requirement 4.4: ARIA attributes update immediately when disabled state changes</li>
          <li>✓ Requirement 4.5: Screen readers announce option name and incompatibility reason</li>
        </ul>
      </div>

      <div className="mb-4 space-y-2">
        <p className="text-gray-300">
          <strong>Manual Testing Instructions:</strong>
        </p>
        <ol className="text-gray-300 list-decimal list-inside space-y-1">
          <li>Open browser DevTools and inspect the Express or Fastify buttons</li>
          <li>Verify aria-disabled="true" is present on disabled options</li>
          <li>Verify aria-describedby points to a hidden description element</li>
          <li>Verify the description element contains the incompatibility message</li>
          <li>Use Tab key to navigate - disabled options should be focusable</li>
          <li>Press Enter or Space on a disabled option - it should NOT be selected</li>
          <li>Use a screen reader (VoiceOver on Mac, NVDA on Windows) to verify announcements</li>
        </ol>
      </div>

      <div className="mb-8 p-4 bg-gray-700 rounded">
        <h3 className="text-white text-lg mb-2">Expected DOM Structure:</h3>
        <pre className="text-gray-300 text-sm overflow-x-auto">
{`<div>
  <div id="option-desc-express" class="sr-only" role="status" aria-live="polite">
    Express cannot be used with Next.js. Next.js has its own API routes.
  </div>
  <button
    aria-disabled="true"
    aria-describedby="option-desc-express"
    tabindex="0"
    ...
  >
    ...
  </button>
</div>`}
        </pre>
      </div>

      <OptionGrid
        options={testOptions}
        selected="nextjs"
        onSelect={handleSelect}
        label="Select a framework"
      />

      <div className="mt-8 p-4 bg-blue-900 rounded">
        <h3 className="text-white text-lg mb-2">Console Output:</h3>
        <p className="text-gray-300 text-sm">
          Open the browser console to see selection events. Disabled options should NOT log anything when clicked.
        </p>
      </div>
    </div>
  );
}
