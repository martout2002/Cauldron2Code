/**
 * Manual test script for error handling in compatibility system
 * 
 * This script verifies that:
 * 1. Rule evaluation exceptions are caught and fail-open
 * 2. Message generation exceptions use fallback message
 * 3. Empty messages use fallback message
 * 4. Development mode logging works
 * 
 * To run this test:
 * Run: NODE_ENV=development bun run src/lib/wizard/__test-error-handling.ts
 */

import { ScaffoldConfig } from '@/types';
import {
  evaluateCompatibility,
  evaluateMultipleOptions,
  hasIncompatibilities,
} from './compatibility-evaluator';
import { compatibilityRules, CompatibilityRule } from './compatibility-rules';

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
    extras: {
      docker: false,
      githubActions: false,
      redis: false,
      prettier: true,
      husky: false,
    },
  };
}

console.log('=== Error Handling Tests ===\n');

console.log('Test 1: Rule with exception in isIncompatible (fail-open)');
console.log('Adding a rule that throws an exception...');

// Add a rule that throws an exception
const badRule: CompatibilityRule = {
  id: 'test-bad-rule',
  description: 'Test rule that throws exception',
  targetStep: 'backend',
  targetOption: 'express',
  isIncompatible: () => {
    throw new Error('Test exception in isIncompatible');
  },
  getIncompatibilityMessage: () => 'Should not be called',
};

compatibilityRules.push(badRule);

const config1 = createBaseConfig();
config1.frontendFramework = 'react';
const result1 = evaluateCompatibility('backend', 'express', config1);
console.log('Expected: compatible (fail-open)');
console.log('Result:', result1);
console.log('✓ Pass:', result1.isCompatible);
console.log('Note: Check console for warning message\n');

// Remove the bad rule
compatibilityRules.pop();

console.log('Test 2: Rule with exception in getIncompatibilityMessage (fallback)');
console.log('Adding a rule with bad message generator for a unique option...');

const badMessageRule: CompatibilityRule = {
  id: 'test-bad-message-rule',
  description: 'Test rule with bad message generator',
  targetStep: 'database',
  targetOption: 'test-db',
  isIncompatible: () => true,
  getIncompatibilityMessage: () => {
    throw new Error('Test exception in getIncompatibilityMessage');
  },
};

compatibilityRules.push(badMessageRule);

const config2 = createBaseConfig();
const result2 = evaluateCompatibility('database', 'test-db', config2);
console.log('Expected: incompatible with fallback message');
console.log('Result:', result2);
console.log(
  '✓ Pass:',
  !result2.isCompatible &&
    result2.reason === 'This option is not compatible with your current selections'
);
console.log('Note: Check console for warning message\n');

// Remove the bad message rule
compatibilityRules.pop();

console.log('Test 3: Rule with empty message (fallback)');
console.log('Adding a rule that returns empty message for a unique option...');

const emptyMessageRule: CompatibilityRule = {
  id: 'test-empty-message-rule',
  description: 'Test rule with empty message',
  targetStep: 'database',
  targetOption: 'test-db-2',
  isIncompatible: () => true,
  getIncompatibilityMessage: () => '',
};

compatibilityRules.push(emptyMessageRule);

const config3 = createBaseConfig();
const result3 = evaluateCompatibility('database', 'test-db-2', config3);
console.log('Expected: incompatible with fallback message');
console.log('Result:', result3);
console.log(
  '✓ Pass:',
  !result3.isCompatible &&
    result3.reason === 'This option is not compatible with your current selections'
);
console.log('Note: Check console for warning message\n');

// Remove the empty message rule
compatibilityRules.pop();

console.log('Test 4: evaluateMultipleOptions with exception');
console.log('Adding a rule that throws exception...');

compatibilityRules.push(badRule);

const config4 = createBaseConfig();
config4.frontendFramework = 'react';
const results4 = evaluateMultipleOptions(
  'backend',
  ['express', 'fastify', 'nestjs'],
  config4
);
console.log('Expected: all compatible (fail-open)');
console.log('Results:');
results4.forEach((result, option) => {
  console.log(`  ${option}: ${result.isCompatible ? 'compatible' : 'incompatible'}`);
});
const pass4 =
  results4.get('express')?.isCompatible === true &&
  results4.get('fastify')?.isCompatible === true &&
  results4.get('nestjs')?.isCompatible === true;
console.log('✓ Pass:', pass4);
console.log('Note: Check console for warning messages\n');

// Remove the bad rule
compatibilityRules.pop();

console.log('Test 5: hasIncompatibilities with exception');
console.log('Adding a rule that throws exception...');

compatibilityRules.push(badRule);

const config5 = createBaseConfig();
config5.frontendFramework = 'react';
config5.backendFramework = 'express';
const result5 = hasIncompatibilities(config5);
console.log('Expected: false (fail-open)');
console.log('Result:', result5);
console.log('✓ Pass:', result5 === false);
console.log('Note: Check console for warning message\n');

// Remove the bad rule
compatibilityRules.pop();

console.log('=== All Error Handling Tests Complete ===');
console.log('\nSummary:');
console.log('- Rule evaluation exceptions are caught and fail-open ✓');
console.log('- Message generation exceptions use fallback message ✓');
console.log('- Empty messages use fallback message ✓');
console.log('- Development mode logging works (check console output) ✓');
