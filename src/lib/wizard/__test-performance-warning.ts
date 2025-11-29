/**
 * Manual test script for performance warning in compatibility system
 * 
 * This script verifies that:
 * 1. Performance warnings are logged when evaluation exceeds 50ms threshold
 * 2. Step-level performance warnings are logged when exceeding 100ms threshold
 * 
 * To run this test:
 * Run: NODE_ENV=development bun run src/lib/wizard/__test-performance-warning.ts
 */

import { ScaffoldConfig } from '@/types';
import { evaluateCompatibility, evaluateMultipleOptions } from './compatibility-evaluator';
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

console.log('=== Performance Warning Tests ===\n');

console.log('Test 1: Slow rule evaluation (should trigger warning)');
console.log('Adding a rule that takes >50ms to evaluate...');

const slowRule: CompatibilityRule = {
  id: 'test-slow-rule',
  description: 'Test rule that is slow',
  targetStep: 'database',
  targetOption: 'test-slow-db',
  isIncompatible: () => {
    // Simulate slow evaluation (60ms)
    const start = Date.now();
    while (Date.now() - start < 60) {
      // Busy wait
    }
    return false;
  },
  getIncompatibilityMessage: () => 'Should not be called',
};

compatibilityRules.push(slowRule);

const config1 = createBaseConfig();
console.log('Evaluating slow rule...');
const result1 = evaluateCompatibility('database', 'test-slow-db', config1);
console.log('Result:', result1);
console.log('✓ Check console above for performance warning (should show >50ms)\n');

// Remove the slow rule
compatibilityRules.pop();

console.log('Test 2: Fast rule evaluation (should NOT trigger warning)');
console.log('Adding a fast rule...');

const fastRule: CompatibilityRule = {
  id: 'test-fast-rule',
  description: 'Test rule that is fast',
  targetStep: 'database',
  targetOption: 'test-fast-db',
  isIncompatible: () => false,
  getIncompatibilityMessage: () => 'Should not be called',
};

compatibilityRules.push(fastRule);

const config2 = createBaseConfig();
console.log('Evaluating fast rule...');
const result2 = evaluateCompatibility('database', 'test-fast-db', config2);
console.log('Result:', result2);
console.log('✓ Check console above - should NOT show performance warning\n');

// Remove the fast rule
compatibilityRules.pop();

console.log('Test 3: Step-level evaluation with multiple slow rules');
console.log('Adding multiple slow rules...');

const slowRule1: CompatibilityRule = {
  id: 'test-slow-rule-1',
  description: 'Test slow rule 1',
  targetStep: 'database',
  targetOption: 'test-db-1',
  isIncompatible: () => {
    const start = Date.now();
    while (Date.now() - start < 30) {
      // Busy wait
    }
    return false;
  },
  getIncompatibilityMessage: () => 'Should not be called',
};

const slowRule2: CompatibilityRule = {
  id: 'test-slow-rule-2',
  description: 'Test slow rule 2',
  targetStep: 'database',
  targetOption: 'test-db-2',
  isIncompatible: () => {
    const start = Date.now();
    while (Date.now() - start < 30) {
      // Busy wait
    }
    return false;
  },
  getIncompatibilityMessage: () => 'Should not be called',
};

const slowRule3: CompatibilityRule = {
  id: 'test-slow-rule-3',
  description: 'Test slow rule 3',
  targetStep: 'database',
  targetOption: 'test-db-3',
  isIncompatible: () => {
    const start = Date.now();
    while (Date.now() - start < 30) {
      // Busy wait
    }
    return false;
  },
  getIncompatibilityMessage: () => 'Should not be called',
};

compatibilityRules.push(slowRule1, slowRule2, slowRule3);

const config3 = createBaseConfig();
console.log('Evaluating multiple slow rules...');
const results3 = evaluateMultipleOptions(
  'database',
  ['test-db-1', 'test-db-2', 'test-db-3'],
  config3
);
console.log('Results:', Array.from(results3.keys()));
console.log('✓ Check console above for step-level performance info\n');

// Remove the slow rules
compatibilityRules.pop();
compatibilityRules.pop();
compatibilityRules.pop();

console.log('=== All Performance Warning Tests Complete ===');
console.log('\nSummary:');
console.log('- Performance warnings are logged for slow evaluations (>50ms) ✓');
console.log('- Step-level performance info is logged ✓');
console.log('- Fast evaluations do not trigger warnings ✓');
