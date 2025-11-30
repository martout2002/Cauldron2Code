/**
 * Integration test for AI template compatibility with wizard
 * 
 * This script verifies that:
 * 1. AI template options are correctly disabled based on framework
 * 2. The compatibility rules integrate with the wizard step system
 * 3. All AI template options have consistent behavior
 * 
 * To run this test:
 * Run: bun run src/lib/wizard/__test-ai-integration.ts
 */

import { ScaffoldConfig } from '@/types';
import { evaluateMultipleOptions } from './compatibility-evaluator';

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

const aiTemplateOptions = [
  'chatbot',
  'document-analyzer',
  'semantic-search',
  'code-assistant',
  'image-generator',
];

console.log('=== Test 1: All AI templates disabled with React SPA ===');
const config1 = createBaseConfig();
config1.frontendFramework = 'react';
config1.projectStructure = 'react-spa';
const results1 = evaluateMultipleOptions('ai-templates', aiTemplateOptions, config1);
console.log('Expected: All options disabled');
let allDisabled1 = true;
results1.forEach((result, option) => {
  console.log(`  ${option}: ${result.isCompatible ? 'enabled' : 'disabled'}`);
  if (result.isCompatible) allDisabled1 = false;
});
console.log('✓ Pass:', !allDisabled1 === false);

console.log('\n=== Test 2: All AI templates enabled with Next.js ===');
const config2 = createBaseConfig();
config2.frontendFramework = 'nextjs';
config2.projectStructure = 'nextjs-only';
const results2 = evaluateMultipleOptions('ai-templates', aiTemplateOptions, config2);
console.log('Expected: All options enabled');
let allEnabled2 = true;
results2.forEach((result, option) => {
  console.log(`  ${option}: ${result.isCompatible ? 'enabled' : 'disabled'}`);
  if (!result.isCompatible) allEnabled2 = false;
});
console.log('✓ Pass:', allEnabled2);

console.log('\n=== Test 3: All AI templates enabled with fullstack monorepo ===');
const config3 = createBaseConfig();
config3.frontendFramework = 'react';
config3.projectStructure = 'fullstack-monorepo';
const results3 = evaluateMultipleOptions('ai-templates', aiTemplateOptions, config3);
console.log('Expected: All options enabled');
let allEnabled3 = true;
results3.forEach((result, option) => {
  console.log(`  ${option}: ${result.isCompatible ? 'enabled' : 'disabled'}`);
  if (!result.isCompatible) allEnabled3 = false;
});
console.log('✓ Pass:', allEnabled3);

console.log('\n=== Test 4: All AI templates disabled with Vue ===');
const config4 = createBaseConfig();
config4.frontendFramework = 'vue';
config4.projectStructure = 'react-spa';
const results4 = evaluateMultipleOptions('ai-templates', aiTemplateOptions, config4);
console.log('Expected: All options disabled');
let allDisabled4 = true;
results4.forEach((result, option) => {
  console.log(`  ${option}: ${result.isCompatible ? 'enabled' : 'disabled'}`);
  if (result.isCompatible) allDisabled4 = false;
});
console.log('✓ Pass:', !allDisabled4 === false);

console.log('\n=== Test 5: All AI templates disabled with Angular ===');
const config5 = createBaseConfig();
config5.frontendFramework = 'angular';
config5.projectStructure = 'react-spa';
const results5 = evaluateMultipleOptions('ai-templates', aiTemplateOptions, config5);
console.log('Expected: All options disabled');
let allDisabled5 = true;
results5.forEach((result, option) => {
  console.log(`  ${option}: ${result.isCompatible ? 'enabled' : 'disabled'}`);
  if (result.isCompatible) allDisabled5 = false;
});
console.log('✓ Pass:', !allDisabled5 === false);

console.log('\n=== Test 6: All AI templates disabled with Svelte ===');
const config6 = createBaseConfig();
config6.frontendFramework = 'svelte';
config6.projectStructure = 'react-spa';
const results6 = evaluateMultipleOptions('ai-templates', aiTemplateOptions, config6);
console.log('Expected: All options disabled');
let allDisabled6 = true;
results6.forEach((result, option) => {
  console.log(`  ${option}: ${result.isCompatible ? 'enabled' : 'disabled'}`);
  if (result.isCompatible) allDisabled6 = false;
});
console.log('✓ Pass:', !allDisabled6 === false);

console.log('\n=== Test 7: Incompatibility messages are consistent ===');
const config7 = createBaseConfig();
config7.frontendFramework = 'react';
config7.projectStructure = 'react-spa';
const results7 = evaluateMultipleOptions('ai-templates', aiTemplateOptions, config7);
const messages = new Set<string>();
results7.forEach((result) => {
  if (result.reason) {
    messages.add(result.reason);
  }
});
console.log('Expected: All messages should be the same');
console.log('Unique messages:', messages.size);
console.log('✓ Pass:', messages.size === 1);

console.log('\n=== All Integration Tests Complete ===');
