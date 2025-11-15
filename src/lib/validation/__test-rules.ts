/**
 * Manual test script for validation rules
 * Run with: bun run src/lib/validation/__test-rules.ts
 */

import { VALIDATION_RULES } from './rules';
import type { ScaffoldConfig } from '../../types';

// Helper to create a base valid config
function createBaseConfig(): ScaffoldConfig {
  return {
    projectName: 'test-project',
    description: 'Test project description',
    frontendFramework: 'nextjs',
    backendFramework: 'none',
    buildTool: 'auto',
    projectStructure: 'nextjs-only',
    nextjsRouter: 'app',
    auth: 'none',
    database: 'none',
    api: 'rest-fetch',
    styling: 'tailwind',
    shadcn: true,
    colorScheme: 'purple',
    deployment: ['vercel'],
    aiTemplate: 'none',
    extras: {
      docker: false,
      githubActions: false,
      redis: false,
      prettier: true,
      husky: false,
    },
  };
}

// Test runner
function runTest(testName: string, config: ScaffoldConfig, expectedRuleIds: string[]) {
  const triggeredRules = VALIDATION_RULES.filter(rule => rule.check(config));
  const triggeredIds = triggeredRules.map(r => r.id);
  
  const passed = expectedRuleIds.every(id => triggeredIds.includes(id)) &&
                 triggeredIds.every(id => expectedRuleIds.includes(id));
  
  if (passed) {
    console.log(`✅ ${testName}`);
  } else {
    console.log(`❌ ${testName}`);
    console.log(`   Expected: [${expectedRuleIds.join(', ')}]`);
    console.log(`   Got: [${triggeredIds.join(', ')}]`);
    triggeredRules.forEach(rule => {
      console.log(`   - ${rule.id}: ${rule.message} (${rule.severity})`);
    });
  }
  
  return passed;
}

console.log('Testing Validation Rules\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: nextjs-api-requires-nextjs rule
totalTests++;
if (runTest(
  'Test 1: Next.js API routes require Next.js frontend',
  {
    ...createBaseConfig(),
    frontendFramework: 'react',
    backendFramework: 'nextjs-api',
    projectStructure: 'react-spa',
  },
  ['nextjs-api-requires-nextjs', 'react-spa-no-backend']
)) passedTests++;

// Test 2: nextjs-only-structure rule
totalTests++;
if (runTest(
  'Test 2: Next.js only structure requires Next.js frontend',
  {
    ...createBaseConfig(),
    frontendFramework: 'react',
    projectStructure: 'nextjs-only',
  },
  ['nextjs-only-structure']
)) passedTests++;

// Test 3: express-api-only-no-frontend warning
totalTests++;
if (runTest(
  'Test 3: Express API only shows warning',
  {
    ...createBaseConfig(),
    projectStructure: 'express-api-only',
    deployment: ['railway'],
  },
  ['express-api-only-no-frontend', 'docker-deployment-recommendation']
)) passedTests++;

// Test 4: react-spa-no-backend warning
totalTests++;
if (runTest(
  'Test 4: React SPA with backend shows warning',
  {
    ...createBaseConfig(),
    frontendFramework: 'react',
    backendFramework: 'express',
    projectStructure: 'react-spa',
  },
  ['react-spa-no-backend']
)) passedTests++;

// Test 5: webpack-svelte-warning
totalTests++;
if (runTest(
  'Test 5: Webpack with Svelte shows warning',
  {
    ...createBaseConfig(),
    frontendFramework: 'svelte',
    buildTool: 'webpack',
    projectStructure: 'react-spa',
  },
  ['webpack-svelte-warning']
)) passedTests++;

// Test 6: trpc-monorepo updated rule
totalTests++;
if (runTest(
  'Test 6: tRPC with Express API only shows warning',
  {
    ...createBaseConfig(),
    api: 'trpc',
    projectStructure: 'express-api-only',
    deployment: ['railway'],
  },
  ['trpc-monorepo', 'express-api-only-no-frontend', 'docker-deployment-recommendation']
)) passedTests++;

// Test 7: vercel-express updated rule
totalTests++;
if (runTest(
  'Test 7: Express API only cannot deploy to Vercel',
  {
    ...createBaseConfig(),
    projectStructure: 'express-api-only',
    deployment: ['vercel'],
  },
  ['vercel-express', 'express-api-only-no-frontend']
)) passedTests++;

// Test 8: Valid Next.js only config (no errors)
totalTests++;
if (runTest(
  'Test 8: Valid Next.js only config has no errors',
  {
    ...createBaseConfig(),
    frontendFramework: 'nextjs',
    backendFramework: 'nextjs-api',
    projectStructure: 'nextjs-only',
  },
  []
)) passedTests++;

// Test 9: Valid React SPA config (no backend, no warnings)
totalTests++;
if (runTest(
  'Test 9: Valid React SPA config has no errors',
  {
    ...createBaseConfig(),
    frontendFramework: 'react',
    backendFramework: 'none',
    projectStructure: 'react-spa',
  },
  []
)) passedTests++;

// Test 10: Valid monorepo config
totalTests++;
if (runTest(
  'Test 10: Valid monorepo config has no errors',
  {
    ...createBaseConfig(),
    frontendFramework: 'nextjs',
    backendFramework: 'express',
    projectStructure: 'fullstack-monorepo',
  },
  []
)) passedTests++;

console.log(`\n${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('\n✅ All validation rules working correctly!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed');
  process.exit(1);
}
