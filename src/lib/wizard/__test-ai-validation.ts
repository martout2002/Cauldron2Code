/**
 * Test file for AI template validation functions
 * This file verifies that the validation functions work correctly
 * Requirements: 4.1, 4.4
 */

import { ScaffoldConfig } from '@/types';
import {
  validateAITemplateStep,
  validateAIProviderStep,
} from './wizard-validation';

// Helper to create a minimal valid config
function createTestConfig(
  overrides: Partial<ScaffoldConfig> = {}
): ScaffoldConfig {
  return {
    projectName: 'test-project',
    description: 'Test description',
    frontendFramework: 'nextjs',
    backendFramework: 'none',
    buildTool: 'auto',
    projectStructure: 'nextjs-only',
    auth: 'none',
    database: 'none',
    api: 'rest-fetch',
    styling: 'tailwind',
    shadcn: false,
    colorScheme: 'purple',
    deployment: ['vercel'],
    aiTemplates: [],
    aiProvider: undefined,
    extras: {
      docker: false,
      githubActions: false,
      redis: false,
      prettier: false,
      husky: false,
    },
    ...overrides,
  };
}

console.log('Testing AI Template Validation Functions\n');

// Test 1: Empty AI templates array is valid
console.log('Test 1: Empty AI templates array should be valid');
const result1 = validateAITemplateStep([]);
console.log('Result:', result1);
console.assert(result1.isValid === true, 'Empty array should be valid');
console.log('✓ Passed\n');

// Test 2: Valid AI templates
console.log('Test 2: Valid AI templates should pass validation');
const result2 = validateAITemplateStep(['chatbot', 'document-analyzer']);
console.log('Result:', result2);
console.assert(result2.isValid === true, 'Valid templates should be valid');
console.log('✓ Passed\n');

// Test 3: Invalid AI template
console.log('Test 3: Invalid AI template should fail validation');
const result3 = validateAITemplateStep(['invalid-template'] as any);
console.log('Result:', result3);
console.assert(result3.isValid === false, 'Invalid template should fail');
console.assert(
  result3.error?.includes('Invalid AI template'),
  'Error message should mention invalid template'
);
console.log('✓ Passed\n');

// Test 4: AI provider validation - no templates selected
console.log('Test 4: No AI provider required when no templates selected');
const config4 = createTestConfig({
  aiTemplates: [],
  aiProvider: undefined,
});
const result4 = validateAIProviderStep(config4);
console.log('Result:', result4);
console.assert(
  result4.isValid === true,
  'Provider not required when no templates'
);
console.log('✓ Passed\n');

// Test 5: AI provider validation - templates selected but no provider
console.log('Test 5: AI provider required when templates are selected');
const config5 = createTestConfig({
  aiTemplates: ['chatbot'],
  aiProvider: undefined,
});
const result5 = validateAIProviderStep(config5);
console.log('Result:', result5);
console.assert(
  result5.isValid === false,
  'Provider required when templates selected'
);
console.assert(
  result5.error?.includes('Please select an AI provider'),
  'Error message should mention provider requirement'
);
console.log('✓ Passed\n');

// Test 6: AI provider validation - templates and provider selected
console.log('Test 6: Valid when both templates and provider selected');
const config6 = createTestConfig({
  aiTemplates: ['chatbot', 'document-analyzer'],
  aiProvider: 'anthropic',
});
const result6 = validateAIProviderStep(config6);
console.log('Result:', result6);
console.assert(
  result6.isValid === true,
  'Valid when both templates and provider selected'
);
console.log('✓ Passed\n');

// Test 7: AI provider validation - invalid provider
console.log('Test 7: Invalid AI provider should fail validation');
const config7 = createTestConfig({
  aiTemplates: ['chatbot'],
  aiProvider: 'invalid-provider' as any,
});
const result7 = validateAIProviderStep(config7);
console.log('Result:', result7);
console.assert(result7.isValid === false, 'Invalid provider should fail');
console.assert(
  result7.error?.includes('Invalid AI provider'),
  'Error message should mention invalid provider'
);
console.log('✓ Passed\n');

// Test 8: Multiple valid templates
console.log('Test 8: Multiple valid AI templates should pass');
const result8 = validateAITemplateStep([
  'chatbot',
  'document-analyzer',
  'semantic-search',
  'code-assistant',
  'image-generator',
]);
console.log('Result:', result8);
console.assert(result8.isValid === true, 'All valid templates should pass');
console.log('✓ Passed\n');

console.log('All AI validation tests passed! ✓');
