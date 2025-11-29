/**
 * Manual test script for compatibility evaluator caching
 * 
 * This script verifies that:
 * 1. Results are cached and reused on subsequent calls
 * 2. Cache invalidation works correctly
 * 3. Step-level caching works for batch evaluations
 * 4. Performance metrics are tracked correctly
 * 
 * Requirements: 8.1, 8.2, 8.4
 * 
 * To run this test:
 * Run: bun run src/lib/wizard/__test-caching.ts
 */

import { ScaffoldConfig } from '@/types';
import {
  evaluateCompatibility,
  evaluateMultipleOptions,
  invalidateAllCaches,
  getPerformanceMetrics,
  resetPerformanceMetrics,
} from './compatibility-evaluator';

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

console.log('=== Test 1: Cache Hit on Repeated Evaluation ===');
resetPerformanceMetrics();
const config1 = createBaseConfig();
config1.frontendFramework = 'nextjs';

// First evaluation - should be a cache miss
const result1a = evaluateCompatibility('backend', 'express', config1);
const metrics1a = getPerformanceMetrics();
console.log('First evaluation:', result1a);
console.log('Metrics after first call:', metrics1a);

// Second evaluation with same config - should be a cache hit
const result1b = evaluateCompatibility('backend', 'express', config1);
const metrics1b = getPerformanceMetrics();
console.log('Second evaluation:', result1b);
console.log('Metrics after second call:', metrics1b);

const pass1 = 
  metrics1a.cacheMisses === 1 &&
  metrics1a.cacheHits === 0 &&
  metrics1b.cacheMisses === 1 &&
  metrics1b.cacheHits === 1 &&
  result1a.isCompatible === result1b.isCompatible;
console.log('✓ Pass:', pass1, '(cache hit on second call)');

console.log('\n=== Test 2: Cache Invalidation ===');
invalidateAllCaches();
resetPerformanceMetrics();
const config2 = createBaseConfig();
config2.frontendFramework = 'nextjs';

// First evaluation
evaluateCompatibility('backend', 'express', config2);
const metrics2a = getPerformanceMetrics();
console.log('Metrics before invalidation:', metrics2a);

// Second evaluation - should be cache hit
evaluateCompatibility('backend', 'express', config2);
const metrics2a_hit = getPerformanceMetrics();
console.log('Metrics after second call (before invalidation):', metrics2a_hit);

// Invalidate cache
invalidateAllCaches();

// Evaluation after invalidation - should be a cache miss again
evaluateCompatibility('backend', 'express', config2);
const metrics2b = getPerformanceMetrics();
console.log('Metrics after invalidation:', metrics2b);

const pass2 = 
  metrics2a.cacheMisses === 1 &&
  metrics2a.cacheHits === 0 &&
  metrics2a_hit.cacheMisses === 1 &&
  metrics2a_hit.cacheHits === 1 &&
  metrics2b.cacheMisses === 2 &&
  metrics2b.cacheHits === 1;
console.log('✓ Pass:', pass2, '(cache miss after invalidation)');

console.log('\n=== Test 3: Different Configs Have Different Cache Keys ===');
invalidateAllCaches();
resetPerformanceMetrics();
const config3a = createBaseConfig();
config3a.frontendFramework = 'nextjs';

const config3b = createBaseConfig();
config3b.frontendFramework = 'react';

// Evaluate with first config
evaluateCompatibility('backend', 'express', config3a);
const metrics3a = getPerformanceMetrics();
console.log('Metrics after first config:', metrics3a);

// Evaluate with different config - should be a cache miss
evaluateCompatibility('backend', 'express', config3b);
const metrics3b = getPerformanceMetrics();
console.log('Metrics after second config:', metrics3b);

const pass3 = 
  metrics3a.cacheMisses === 1 &&
  metrics3a.cacheHits === 0 &&
  metrics3b.cacheMisses === 2 &&
  metrics3b.cacheHits === 0;
console.log('✓ Pass:', pass3, '(different configs use different cache keys)');

console.log('\n=== Test 4: Step-Level Caching ===');
resetPerformanceMetrics();
invalidateAllCaches();
const config4 = createBaseConfig();
config4.frontendFramework = 'nextjs';

const options = ['none', 'nextjs-api', 'express', 'fastify', 'nestjs'];

// First batch evaluation
const startTime4a = performance.now();
const results4a = evaluateMultipleOptions('backend', options, config4);
const endTime4a = performance.now();
const time4a = endTime4a - startTime4a;
console.log(`First batch evaluation took ${time4a.toFixed(2)}ms`);

// Second batch evaluation with same config - should use step-level cache
const startTime4b = performance.now();
const results4b = evaluateMultipleOptions('backend', options, config4);
const endTime4b = performance.now();
const time4b = endTime4b - startTime4b;
console.log(`Second batch evaluation took ${time4b.toFixed(2)}ms`);

const pass4 = 
  results4a.size === options.length &&
  results4b.size === options.length &&
  time4b < time4a; // Second call should be faster due to caching
console.log('✓ Pass:', pass4, '(step-level cache improves performance)');

console.log('\n=== Test 5: Performance Threshold (< 50ms per evaluation) ===');
resetPerformanceMetrics();
invalidateAllCaches();
const config5 = createBaseConfig();
config5.frontendFramework = 'react';

const startTime5 = performance.now();
evaluateCompatibility('backend', 'express', config5);
const endTime5 = performance.now();
const evaluationTime5 = endTime5 - startTime5;

console.log(`Evaluation time: ${evaluationTime5.toFixed(2)}ms`);
const pass5 = evaluationTime5 < 50;
console.log('✓ Pass:', pass5, '(evaluation under 50ms threshold)');

console.log('\n=== Test 6: Step-Level Precomputation Performance (< 100ms) ===');
resetPerformanceMetrics();
invalidateAllCaches();
const config6 = createBaseConfig();
config6.frontendFramework = 'nextjs';

const allBackendOptions = ['none', 'nextjs-api', 'express', 'fastify', 'nestjs'];

const startTime6 = performance.now();
evaluateMultipleOptions('backend', allBackendOptions, config6);
const endTime6 = performance.now();
const precomputeTime6 = endTime6 - startTime6;

console.log(`Step-level precomputation time: ${precomputeTime6.toFixed(2)}ms`);
const pass6 = precomputeTime6 < 100;
console.log('✓ Pass:', pass6, '(precomputation under 100ms threshold)');

console.log('\n=== Test 7: Cache Persists Across Different Options in Same Step ===');
resetPerformanceMetrics();
invalidateAllCaches();
const config7 = createBaseConfig();
config7.frontendFramework = 'nextjs';

// Evaluate multiple options individually
evaluateCompatibility('backend', 'express', config7);
evaluateCompatibility('backend', 'fastify', config7);
evaluateCompatibility('backend', 'nestjs', config7);

const metrics7a = getPerformanceMetrics();
console.log('Metrics after 3 evaluations:', metrics7a);

// Re-evaluate first option - should be cached
evaluateCompatibility('backend', 'express', config7);
const metrics7b = getPerformanceMetrics();
console.log('Metrics after re-evaluation:', metrics7b);

const pass7 = 
  metrics7a.cacheMisses === 3 &&
  metrics7a.cacheHits === 0 &&
  metrics7b.cacheMisses === 3 &&
  metrics7b.cacheHits === 1;
console.log('✓ Pass:', pass7, '(cache persists across different options)');

console.log('\n=== Test 8: Only Relevant Config Fields Affect Cache ===');
resetPerformanceMetrics();
invalidateAllCaches();
const config8a = createBaseConfig();
config8a.frontendFramework = 'nextjs';
config8a.projectName = 'project-a';
config8a.description = 'Description A';

const config8b = createBaseConfig();
config8b.frontendFramework = 'nextjs';
config8b.projectName = 'project-b'; // Different project name
config8b.description = 'Description B'; // Different description

// Evaluate with first config
evaluateCompatibility('backend', 'express', config8a);
const metrics8a = getPerformanceMetrics();

// Evaluate with second config (only non-relevant fields differ)
// Should be a cache hit because projectName and description don't affect compatibility
evaluateCompatibility('backend', 'express', config8b);
const metrics8b = getPerformanceMetrics();

const pass8 = 
  metrics8a.cacheMisses === 1 &&
  metrics8a.cacheHits === 0 &&
  metrics8b.cacheMisses === 1 &&
  metrics8b.cacheHits === 1;
console.log('✓ Pass:', pass8, '(only relevant fields affect cache key)');

console.log('\n=== All Caching Tests Complete ===');
console.log('\nFinal Performance Metrics:');
const finalMetrics = getPerformanceMetrics();
console.log(finalMetrics);
console.log(`Average evaluation time: ${(finalMetrics.totalTime / finalMetrics.evaluationCount).toFixed(2)}ms`);
console.log(`Cache hit rate: ${((finalMetrics.cacheHits / finalMetrics.evaluationCount) * 100).toFixed(1)}%`);
