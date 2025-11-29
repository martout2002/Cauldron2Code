/**
 * Manual test for OptionGrid tooltip functionality
 * Requirements: 2.1, 2.2, 2.3, 2.5, 8.3
 */

import { OptionGrid } from './OptionGrid';

// Test data with both enabled and disabled options
const testOptions = [
  {
    value: 'nextjs',
    label: 'Next.js',
    icon: '/icons/frameworks/nextjs.svg',
    description: 'React framework with server-side rendering and static generation',
    isDisabled: false,
  },
  {
    value: 'express',
    label: 'Express',
    icon: '/icons/frameworks/express.svg',
    description: 'Fast, unopinionated web framework for Node.js',
    isDisabled: true,
    incompatibilityReason: 'Express cannot be used with Next.js. Next.js has its own API routes. Use "Next.js API" or select a different frontend.',
  },
  {
    value: 'react',
    label: 'React',
    icon: '/icons/frameworks/react.svg',
    description: 'A JavaScript library for building user interfaces',
    isDisabled: false,
  },
  {
    value: 'fastify',
    label: 'Fastify',
    icon: '/icons/frameworks/fastify.svg',
    description: 'Fast and low overhead web framework',
    isDisabled: true,
    incompatibilityReason: 'Fastify cannot be used with Next.js frontend. Currently selected: nextjs',
  },
  {
    value: 'vue',
    label: 'Vue',
    icon: '/icons/frameworks/vue.svg',
    description: 'Progressive JavaScript framework for building UIs',
    isDisabled: false,
  },
];

export function TestTooltipFunctionality() {
  const handleSelect = (value: string | string[]) => {
    console.log('Selected:', value);
  };

  return (
    <div className="p-8 bg-gray-800 min-h-screen">
      <h1 className="text-white text-2xl mb-8">OptionGrid Tooltip Functionality Test</h1>
      
      <div className="mb-8">
        <h2 className="text-white text-xl mb-4">Test Cases:</h2>
        <ul className="text-gray-300 space-y-2">
          <li>✓ Requirement 2.1: Hovering over disabled options shows incompatibility tooltip</li>
          <li>✓ Requirement 2.2: Tooltip includes the name of conflicting option</li>
          <li>✓ Requirement 2.3: Tooltip hides within 200ms after mouse leave</li>
          <li>✓ Requirement 2.5: Enabled options show description tooltip (gray), disabled show incompatibility (red)</li>
          <li>✓ Requirement 8.3: Rapid hover events are debounced by 100ms</li>
        </ul>
      </div>

      <div className="mb-8 space-y-4">
        <div className="bg-gray-700 p-4 rounded">
          <h3 className="text-white font-bold mb-2">Test 1: Description Tooltips (Enabled Options)</h3>
          <p className="text-gray-300">
            Hover over <strong>Next.js</strong>, <strong>React</strong>, or <strong>Vue</strong> (enabled options).
            You should see a gray tooltip with the description after 100ms.
          </p>
        </div>

        <div className="bg-gray-700 p-4 rounded">
          <h3 className="text-white font-bold mb-2">Test 2: Incompatibility Tooltips (Disabled Options)</h3>
          <p className="text-gray-300">
            Hover over <strong>Express</strong> or <strong>Fastify</strong> (disabled options).
            You should see a red tooltip explaining why it's incompatible, including the conflicting option name.
          </p>
        </div>

        <div className="bg-gray-700 p-4 rounded">
          <h3 className="text-white font-bold mb-2">Test 3: Tooltip Hide Timing</h3>
          <p className="text-gray-300">
            Hover over any option, then move your mouse away. The tooltip should disappear within 200ms.
          </p>
        </div>

        <div className="bg-gray-700 p-4 rounded">
          <h3 className="text-white font-bold mb-2">Test 4: Debouncing</h3>
          <p className="text-gray-300">
            Quickly move your mouse across multiple options. Tooltips should only appear after you pause for 100ms.
          </p>
        </div>

        <div className="bg-gray-700 p-4 rounded">
          <h3 className="text-white font-bold mb-2">Test 5: Visual Distinction</h3>
          <p className="text-gray-300">
            Compare tooltips: Enabled options have gray background (bg-gray-900), 
            disabled options have red background (bg-red-900).
          </p>
        </div>
      </div>

      <OptionGrid
        options={testOptions}
        selected="nextjs"
        onSelect={handleSelect}
        label="Select a framework"
      />

      <div className="mt-8 p-4 bg-gray-700 rounded">
        <h3 className="text-white font-bold mb-2">Expected Behavior Summary:</h3>
        <ul className="text-gray-300 space-y-1 list-disc list-inside">
          <li>Tooltips appear after 100ms hover delay (debouncing)</li>
          <li>Tooltips disappear 200ms after mouse leave</li>
          <li>Enabled options: Gray tooltip with description</li>
          <li>Disabled options: Red tooltip with incompatibility reason</li>
          <li>Incompatibility messages include conflicting option names</li>
        </ul>
      </div>
    </div>
  );
}
