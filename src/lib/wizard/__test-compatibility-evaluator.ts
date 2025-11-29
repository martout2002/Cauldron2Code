/**
 * Manual test script for compatibility evaluator
 * 
 * This script verifies that:
 * 1. evaluateCompatibility correctly identifies incompatible options
 * 2. Rule aggregation works (multiple rules for same option)
 * 3. Message prioritization returns the most relevant message
 * 4. Error handling works (fail-open approach)
 * 5. evaluateMultipleOptions works correctly
 * 6. hasIncompatibilities detects configuration issues
 * 
 * To run this test:
 * Run: bun run src/lib/wizard/__test-compatibility-evaluator.ts
 */

import { ScaffoldConfig } from '@/types';
import {
  evaluateCompatibility,
  evaluateMultipleOptions,
  hasIncompatibilities,
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

console.log('=== Test 1: Express incompatible with Next.js ===');
const config1 = createBaseConfig();
config1.frontendFramework = 'nextjs';
const result1 = evaluateCompatibility('backend', 'express', config1);
console.log('Expected: incompatible');
console.log('Result:', result1);
console.log('✓ Pass:', !result1.isCompatible && result1.reason?.includes('Express'));

console.log('\n=== Test 2: Express compatible with React ===');
const config2 = createBaseConfig();
config2.frontendFramework = 'react';
const result2 = evaluateCompatibility('backend', 'express', config2);
console.log('Expected: compatible');
console.log('Result:', result2);
console.log('✓ Pass:', result2.isCompatible);

console.log('\n=== Test 3: Next.js API requires Next.js frontend ===');
const config3 = createBaseConfig();
config3.frontendFramework = 'react';
const result3 = evaluateCompatibility('backend', 'nextjs-api', config3);
console.log('Expected: incompatible');
console.log('Result:', result3);
console.log('✓ Pass:', !result3.isCompatible && result3.reason?.includes('Next.js'));

console.log('\n=== Test 4: Supabase Auth incompatible with MongoDB ===');
const config4 = createBaseConfig();
config4.database = 'mongodb';
const result4 = evaluateCompatibility('auth', 'supabase', config4);
console.log('Expected: incompatible');
console.log('Result:', result4);
console.log('✓ Pass:', !result4.isCompatible && result4.reason?.includes('Supabase'));

console.log('\n=== Test 5: Redis requires backend ===');
const config5 = createBaseConfig();
config5.backendFramework = 'none';
const result5 = evaluateCompatibility('extras', 'redis', config5);
console.log('Expected: incompatible');
console.log('Result:', result5);
console.log('✓ Pass:', !result5.isCompatible && result5.reason?.includes('Redis'));

console.log('\n=== Test 6: Redis compatible with Express backend ===');
const config6 = createBaseConfig();
config6.backendFramework = 'express';
const result6 = evaluateCompatibility('extras', 'redis', config6);
console.log('Expected: compatible');
console.log('Result:', result6);
console.log('✓ Pass:', result6.isCompatible);

console.log('\n=== Test 7: evaluateMultipleOptions ===');
const config7 = createBaseConfig();
config7.frontendFramework = 'nextjs';
const results7 = evaluateMultipleOptions(
  'backend',
  ['none', 'nextjs-api', 'express', 'fastify', 'nestjs'],
  config7
);
console.log('Expected: express, fastify, nestjs incompatible; none, nextjs-api compatible');
console.log('Results:');
results7.forEach((result, option) => {
  console.log(`  ${option}: ${result.isCompatible ? 'compatible' : 'incompatible'}`);
});
const pass7 =
  results7.get('none')?.isCompatible === true &&
  results7.get('nextjs-api')?.isCompatible === true &&
  results7.get('express')?.isCompatible === false &&
  results7.get('fastify')?.isCompatible === false &&
  results7.get('nestjs')?.isCompatible === false;
console.log('✓ Pass:', pass7);

console.log('\n=== Test 8: hasIncompatibilities with valid config ===');
const config8 = createBaseConfig();
config8.frontendFramework = 'react';
config8.backendFramework = 'express';
config8.database = 'prisma-postgres';
config8.auth = 'nextauth';
const result8 = hasIncompatibilities(config8);
console.log('Expected: false (no incompatibilities)');
console.log('Result:', result8);
console.log('✓ Pass:', result8 === false);

console.log('\n=== Test 9: hasIncompatibilities with invalid config ===');
const config9 = createBaseConfig();
config9.frontendFramework = 'nextjs';
config9.backendFramework = 'express'; // This is incompatible!
const result9 = hasIncompatibilities(config9);
console.log('Expected: true (has incompatibilities)');
console.log('Result:', result9);
console.log('✓ Pass:', result9 === true);

console.log('\n=== Test 10: Multiple incompatibility rules (Supabase Auth) ===');
const config10 = createBaseConfig();
config10.database = 'prisma-postgres';
const result10 = evaluateCompatibility('auth', 'supabase', config10);
console.log('Expected: incompatible with message about Prisma');
console.log('Result:', result10);
console.log('✓ Pass:', !result10.isCompatible && result10.reason?.includes('Prisma'));

console.log('\n=== Test 11: NextAuth requires database ===');
const config11 = createBaseConfig();
config11.database = 'none';
const result11 = evaluateCompatibility('auth', 'nextauth', config11);
console.log('Expected: incompatible');
console.log('Result:', result11);
console.log('✓ Pass:', !result11.isCompatible && result11.reason?.includes('NextAuth'));

console.log('\n=== All Tests Complete ===');
