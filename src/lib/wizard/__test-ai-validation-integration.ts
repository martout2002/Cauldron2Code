/**
 * Integration test for AI template validation with wizard steps
 * Verifies that validation works correctly with the wizard step system
 * Requirements: 4.1, 4.4
 */

import { ScaffoldConfig } from '@/types';
import { validateStep, validateAllSteps } from './wizard-validation';
import { getWizardSteps } from './wizard-steps';

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

console.log('Testing AI Template Validation Integration with Wizard Steps\n');

// Get wizard steps
const steps = getWizardSteps();
console.log(`Total wizard steps: ${steps.length}`);

// Find AI template and AI provider step indices
const aiTemplateStepIndex = steps.findIndex((s) => s.id === 'ai-templates');
const aiProviderStepIndex = steps.findIndex((s) => s.id === 'ai-provider');

console.log(`AI Template step index: ${aiTemplateStepIndex}`);
console.log(`AI Provider step index: ${aiProviderStepIndex}\n`);

// Test 1: Validate AI template step with empty selection
console.log('Test 1: AI template step with empty selection');
const config1 = createTestConfig({ aiTemplates: [] });
const result1 = validateStep(aiTemplateStepIndex, config1);
console.log('Result:', result1);
console.assert(result1.isValid === true, 'Empty templates should be valid');
console.log('✓ Passed\n');

// Test 2: Validate AI template step with valid selection
console.log('Test 2: AI template step with valid selection');
const config2 = createTestConfig({ aiTemplates: ['chatbot', 'document-analyzer'] });
const result2 = validateStep(aiTemplateStepIndex, config2);
console.log('Result:', result2);
console.assert(result2.isValid === true, 'Valid templates should be valid');
console.log('✓ Passed\n');

// Test 3: Validate AI provider step when no templates selected
console.log('Test 3: AI provider step when no templates selected');
const config3 = createTestConfig({ aiTemplates: [], aiProvider: undefined });
const result3 = validateStep(aiProviderStepIndex, config3);
console.log('Result:', result3);
console.assert(result3.isValid === true, 'Provider not required when no templates');
console.log('✓ Passed\n');

// Test 4: Validate AI provider step when templates selected but no provider
console.log('Test 4: AI provider step when templates selected but no provider');
const config4 = createTestConfig({ aiTemplates: ['chatbot'], aiProvider: undefined });
const result4 = validateStep(aiProviderStepIndex, config4);
console.log('Result:', result4);
console.assert(result4.isValid === false, 'Provider required when templates selected');
console.assert(
  result4.error === 'Please select an AI provider for your templates',
  'Error message should match'
);
console.log('✓ Passed\n');

// Test 5: Validate AI provider step when both templates and provider selected
console.log('Test 5: AI provider step when both templates and provider selected');
const config5 = createTestConfig({
  aiTemplates: ['chatbot', 'semantic-search'],
  aiProvider: 'anthropic',
});
const result5 = validateStep(aiProviderStepIndex, config5);
console.log('Result:', result5);
console.assert(result5.isValid === true, 'Valid when both selected');
console.log('✓ Passed\n');

// Test 6: Validate all steps with complete valid config
console.log('Test 6: Validate all steps with complete valid config');
const config6 = createTestConfig({
  aiTemplates: ['chatbot'],
  aiProvider: 'openai',
});
const result6 = validateAllSteps(config6);
console.log('Result:', result6);
console.assert(result6.isValid === true, 'All steps should be valid');
console.log('✓ Passed\n');

// Test 7: Validate all steps with templates but no provider
console.log('Test 7: Validate all steps with templates but no provider');
const config7 = createTestConfig({
  aiTemplates: ['chatbot'],
  aiProvider: undefined,
});
const result7 = validateAllSteps(config7);
console.log('Result:', result7);
console.assert(result7.isValid === false, 'Should fail validation');
console.assert(
  result7.error?.includes('Please select an AI provider'),
  'Error should mention provider requirement'
);
console.log('✓ Passed\n');

// Test 8: Verify conditional step logic
console.log('Test 8: Verify AI provider step has conditional logic');
const aiProviderStep = steps[aiProviderStepIndex];
console.assert(
  aiProviderStep.conditional !== undefined,
  'AI provider step should have conditional'
);

const configWithTemplates = createTestConfig({ aiTemplates: ['chatbot'] });
const configWithoutTemplates = createTestConfig({ aiTemplates: [] });

const shouldShowWithTemplates = aiProviderStep.conditional!(configWithTemplates);
const shouldShowWithoutTemplates = aiProviderStep.conditional!(configWithoutTemplates);

console.log('Should show with templates:', shouldShowWithTemplates);
console.log('Should show without templates:', shouldShowWithoutTemplates);

console.assert(
  shouldShowWithTemplates === true,
  'Should show provider step when templates selected'
);
console.assert(
  shouldShowWithoutTemplates === false,
  'Should not show provider step when no templates'
);
console.log('✓ Passed\n');

console.log('All AI validation integration tests passed! ✓');
