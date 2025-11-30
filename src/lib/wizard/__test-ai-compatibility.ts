/**
 * Manual test script for AI template compatibility
 * 
 * This script verifies that:
 * 1. isAITemplateCompatible correctly identifies compatible frameworks
 * 2. getCompatibleAIProviders returns correct providers
 * 3. AI template compatibility rules work correctly
 * 
 * To run this test:
 * Run: bun run src/lib/wizard/__test-ai-compatibility.ts
 */

import { ScaffoldConfig } from '@/types';
import {
  isAITemplateCompatible,
  getCompatibleAIProviders,
} from './compatibility-rules';
import { evaluateCompatibility } from './compatibility-evaluator';

// Helper to create a base config
function createBaseConfig(): ScaffoldConfig {
  return {
    projectName: 'test-project',
    description: 'Test project',
    frontendFramework: 'react',
    backendFramework: 'none',
    buildTool: 'auto',
    projectStructure: 'react-spa',
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
      prettier: true,
      husky: false,
    },
  };
}

console.log('=== Test 1: Next.js is compatible with AI templates ===');
const config1 = createBaseConfig();
config1.frontendFramework = 'nextjs';
config1.projectStructure = 'nextjs-only';
const result1 = isAITemplateCompatible(config1);
console.log('Expected: true');
console.log('Result:', result1);
console.log('✓ Pass:', result1 === true);

console.log('\n=== Test 2: Fullstack monorepo is compatible with AI templates ===');
const config2 = createBaseConfig();
config2.frontendFramework = 'react';
config2.projectStructure = 'fullstack-monorepo';
const result2 = isAITemplateCompatible(config2);
console.log('Expected: true');
console.log('Result:', result2);
console.log('✓ Pass:', result2 === true);

console.log('\n=== Test 3: React SPA is NOT compatible with AI templates ===');
const config3 = createBaseConfig();
config3.frontendFramework = 'react';
config3.projectStructure = 'react-spa';
const result3 = isAITemplateCompatible(config3);
console.log('Expected: false');
console.log('Result:', result3);
console.log('✓ Pass:', result3 === false);

console.log('\n=== Test 4: Vue is NOT compatible with AI templates ===');
const config4 = createBaseConfig();
config4.frontendFramework = 'vue';
config4.projectStructure = 'react-spa';
const result4 = isAITemplateCompatible(config4);
console.log('Expected: false');
console.log('Result:', result4);
console.log('✓ Pass:', result4 === false);

console.log('\n=== Test 5: getCompatibleAIProviders with templates selected ===');
const result5 = getCompatibleAIProviders(['chatbot', 'document-analyzer']);
console.log('Expected: [anthropic, openai, aws-bedrock, gemini]');
console.log('Result:', result5);
const pass5 = result5.length === 4 && 
  result5.includes('anthropic') && 
  result5.includes('openai') && 
  result5.includes('aws-bedrock') && 
  result5.includes('gemini');
console.log('✓ Pass:', pass5);

console.log('\n=== Test 6: getCompatibleAIProviders with no templates ===');
const result6 = getCompatibleAIProviders([]);
console.log('Expected: []');
console.log('Result:', result6);
console.log('✓ Pass:', result6.length === 0);

console.log('\n=== Test 7: AI template chatbot incompatible with React SPA ===');
const config7 = createBaseConfig();
config7.frontendFramework = 'react';
config7.projectStructure = 'react-spa';
const result7 = evaluateCompatibility('ai-templates', 'chatbot', config7);
console.log('Expected: incompatible');
console.log('Result:', result7);
console.log('✓ Pass:', !result7.isCompatible && result7.reason?.includes('Next.js'));

console.log('\n=== Test 8: AI template chatbot compatible with Next.js ===');
const config8 = createBaseConfig();
config8.frontendFramework = 'nextjs';
config8.projectStructure = 'nextjs-only';
const result8 = evaluateCompatibility('ai-templates', 'chatbot', config8);
console.log('Expected: compatible');
console.log('Result:', result8);
console.log('✓ Pass:', result8.isCompatible);

console.log('\n=== Test 9: AI template document-analyzer incompatible with Vue ===');
const config9 = createBaseConfig();
config9.frontendFramework = 'vue';
config9.projectStructure = 'react-spa';
const result9 = evaluateCompatibility('ai-templates', 'document-analyzer', config9);
console.log('Expected: incompatible');
console.log('Result:', result9);
console.log('✓ Pass:', !result9.isCompatible);

console.log('\n=== Test 10: AI template semantic-search compatible with monorepo ===');
const config10 = createBaseConfig();
config10.frontendFramework = 'react';
config10.projectStructure = 'fullstack-monorepo';
const result10 = evaluateCompatibility('ai-templates', 'semantic-search', config10);
console.log('Expected: compatible');
console.log('Result:', result10);
console.log('✓ Pass:', result10.isCompatible);

console.log('\n=== All Tests Complete ===');
