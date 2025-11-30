/**
 * Manual test for OptionGrid with AI template extended details
 * Requirements: 1.1, 1.2, 1.4, 3.1, 3.2, 3.3
 * 
 * This test verifies:
 * - Multi-select functionality works with AI templates
 * - Disabled state styling is consistent
 * - Hover details show features and generated files for AI templates
 * - Keyboard navigation works with AI template options
 */

import { useState } from 'react';
import { OptionGrid } from './OptionGrid';

// Test data with AI template options including extended details
const aiTemplateOptions = [
  {
    value: 'chatbot',
    label: 'AI Chatbot',
    icon: '/icons/ai/chatbot.svg',
    description: 'Conversational AI with streaming responses',
    features: [
      'Real-time streaming responses',
      'Conversation history',
      'Markdown rendering',
      'Copy code blocks',
    ],
    generatedFiles: [
      'src/app/api/chat/route.ts',
      'src/app/chat/page.tsx',
    ],
  },
  {
    value: 'document-analyzer',
    label: 'Document Analyzer',
    icon: '/icons/ai/document-analyzer.svg',
    description: 'Upload and analyze documents with AI',
    features: [
      'File upload support',
      'Text extraction',
      'AI-powered analysis',
      'Summary generation',
    ],
    generatedFiles: [
      'src/app/api/analyze/route.ts',
      'src/app/analyze/page.tsx',
    ],
  },
  {
    value: 'semantic-search',
    label: 'Semantic Search',
    icon: '/icons/ai/semantic-search.svg',
    description: 'AI-powered search with embeddings',
    features: [
      'Vector embeddings',
      'Semantic similarity',
      'Intelligent ranking',
      'Context-aware results',
    ],
    generatedFiles: [
      'src/app/api/search/route.ts',
      'src/app/search/page.tsx',
    ],
    isDisabled: true,
    incompatibilityReason: 'Semantic search requires Next.js framework',
  },
  {
    value: 'code-assistant',
    label: 'Code Assistant',
    icon: '/icons/ai/code-assistant.svg',
    description: 'AI-powered code generation and explanation',
    features: [
      'Code generation',
      'Code explanation',
      'Syntax highlighting',
      'Multiple languages',
    ],
    generatedFiles: [
      'src/app/api/code-assistant/route.ts',
      'src/app/code-assistant/page.tsx',
    ],
  },
  {
    value: 'image-generator',
    label: 'Image Generator',
    icon: '/icons/ai/image-generator.svg',
    description: 'Generate images from text descriptions',
    features: [
      'Text-to-image generation',
      'Style customization',
      'Image preview',
      'Download support',
    ],
    generatedFiles: [
      'src/app/api/generate-image/route.ts',
      'src/app/generate-image/page.tsx',
    ],
  },
];

export function TestAITemplateOptionGrid() {
  const [selected, setSelected] = useState<string[]>(['chatbot']);

  const handleSelect = (value: string | string[]) => {
    console.log('Selected:', value);
    setSelected(Array.isArray(value) ? value : [value]);
  };

  return (
    <div className="p-8 bg-gray-800 min-h-screen">
      <h1 className="text-white text-2xl mb-8 font-pixelify">
        AI Template OptionGrid Test
      </h1>

      <div className="mb-8">
        <h2 className="text-white text-xl mb-4">Test Cases:</h2>
        <ul className="text-gray-300 space-y-2">
          <li>✓ Requirement 1.1: Multi-select functionality works with AI templates</li>
          <li>✓ Requirement 1.2: Hover shows extended details (features, generated files)</li>
          <li>✓ Requirement 1.4: Multiple AI templates can be selected simultaneously</li>
          <li>✓ Requirement 3.1: Pixel art styling is consistent with other wizard steps</li>
          <li>✓ Requirement 3.2: Hover effects and animations match other option grids</li>
          <li>✓ Requirement 3.3: Selection indicators work correctly</li>
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-white text-lg mb-2">Instructions:</h3>
        <ol className="text-gray-300 space-y-2 list-decimal list-inside">
          <li>Hover over each AI template option to see extended tooltip with features and generated files</li>
          <li>Click multiple options to test multi-select functionality</li>
          <li>Try hovering over the disabled "Semantic Search" option to see incompatibility message</li>
          <li>Use keyboard navigation (Arrow keys, Enter/Space) to navigate and select options</li>
          <li>Verify that disabled options cannot be selected via click or keyboard</li>
        </ol>
      </div>

      <div className="mb-4">
        <p className="text-gray-300 mb-2">
          <strong>Currently Selected:</strong> {selected.length > 0 ? selected.join(', ') : 'None'}
        </p>
      </div>

      <OptionGrid
        options={aiTemplateOptions}
        selected={selected}
        onSelect={handleSelect}
        multiSelect={true}
        label="Select AI templates"
      />

      <div className="mt-8 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-white text-lg mb-2">Expected Behavior:</h3>
        <ul className="text-gray-300 space-y-2">
          <li>• Tooltips should show description, features list, and generated files list</li>
          <li>• Multiple templates can be selected (checkmarks appear on selected items)</li>
          <li>• Disabled option (Semantic Search) shows red tooltip with incompatibility reason</li>
          <li>• Disabled option cannot be selected via click or keyboard</li>
          <li>• Keyboard navigation works: Arrow keys to move, Enter/Space to select</li>
          <li>• Hover effects: enabled options scale up, disabled options do not</li>
        </ul>
      </div>
    </div>
  );
}
