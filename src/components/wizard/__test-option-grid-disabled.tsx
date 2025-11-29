/**
 * Manual test for OptionGrid disabled state functionality
 * Requirements: 1.1, 1.2, 1.5
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
    isDisabled: true, // This option is disabled
    incompatibilityReason: 'Express cannot be used with Next.js',
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
    isDisabled: true, // This option is disabled
    incompatibilityReason: 'Fastify cannot be used with Next.js',
  },
];

export function TestOptionGridDisabled() {
  const handleSelect = (value: string | string[]) => {
    console.log('Selected:', value);
  };

  return (
    <div className="p-8 bg-gray-800 min-h-screen">
      <h1 className="text-white text-2xl mb-8">OptionGrid Disabled State Test</h1>
      
      <div className="mb-8">
        <h2 className="text-white text-xl mb-4">Test Cases:</h2>
        <ul className="text-gray-300 space-y-2">
          <li>✓ Requirement 1.1: Disabled options should have reduced opacity (40%) and cursor-not-allowed</li>
          <li>✓ Requirement 1.1: Disabled options should NOT have hover scale effect</li>
          <li>✓ Requirement 1.2: Clicking disabled options should NOT trigger selection</li>
          <li>✓ Requirement 1.2: Pressing Enter/Space on disabled options should NOT trigger selection</li>
          <li>✓ Requirement 1.5: All disabled options should have consistent styling</li>
        </ul>
      </div>

      <div className="mb-4">
        <p className="text-gray-300 mb-2">
          Try clicking on Express or Fastify (disabled options). They should not be selectable.
        </p>
        <p className="text-gray-300 mb-2">
          Notice the reduced opacity and cursor-not-allowed on disabled options.
        </p>
        <p className="text-gray-300 mb-2">
          Hover over disabled options - they should NOT scale up like enabled options.
        </p>
      </div>

      <OptionGrid
        options={testOptions}
        selected="nextjs"
        onSelect={handleSelect}
        label="Select a framework"
      />
    </div>
  );
}
