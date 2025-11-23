/**
 * Manual test file for ConfigurationAnalyzer
 * 
 * This file can be used to manually verify the ConfigurationAnalyzer
 * implementation by running it with different scaffold configurations.
 */

import { ConfigurationAnalyzer } from './configuration-analyzer';
import type { ScaffoldConfig } from '../../types';

// Test configuration 1: Next.js with Prisma, NextAuth, and AI
const testConfig1: ScaffoldConfig = {
  projectName: 'test-app',
  description: 'Test application',
  frontendFramework: 'nextjs',
  backendFramework: 'nextjs-api',
  buildTool: 'auto',
  projectStructure: 'nextjs-only',
  nextjsRouter: 'app',
  auth: 'nextauth',
  database: 'prisma-postgres',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['vercel'],
  aiTemplate: 'chatbot',
  aiProvider: 'anthropic',
  extras: {
    docker: false,
    githubActions: true,
    redis: false,
    prettier: true,
    husky: false,
  },
};

// Test configuration 2: Monorepo with Supabase and Redis
const testConfig2: ScaffoldConfig = {
  projectName: 'monorepo-app',
  description: 'Full-stack monorepo',
  frontendFramework: 'react',
  backendFramework: 'express',
  buildTool: 'vite',
  projectStructure: 'fullstack-monorepo',
  auth: 'supabase',
  database: 'supabase',
  api: 'rest-axios',
  styling: 'tailwind',
  shadcn: false,
  colorScheme: 'gold',
  deployment: ['railway', 'render'],
  aiTemplate: 'none',
  extras: {
    docker: true,
    githubActions: true,
    redis: true,
    prettier: true,
    husky: true,
  },
};

// Test configuration 3: Simple React SPA with Clerk
const testConfig3: ScaffoldConfig = {
  projectName: 'simple-spa',
  description: 'Simple React SPA',
  frontendFramework: 'react',
  backendFramework: 'none',
  buildTool: 'vite',
  projectStructure: 'react-spa',
  auth: 'clerk',
  database: 'none',
  api: 'rest-fetch',
  styling: 'css-modules',
  shadcn: false,
  colorScheme: 'white',
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

// Test configuration 4: Express API with MongoDB and OpenAI
const testConfig4: ScaffoldConfig = {
  projectName: 'api-server',
  description: 'Express API server',
  frontendFramework: 'nextjs',
  backendFramework: 'express',
  buildTool: 'auto',
  projectStructure: 'express-api-only',
  auth: 'none',
  database: 'mongodb',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: false,
  colorScheme: 'futuristic',
  deployment: ['render'],
  aiTemplate: 'document-analyzer',
  aiProvider: 'openai',
  extras: {
    docker: true,
    githubActions: false,
    redis: true,
    prettier: true,
    husky: false,
  },
};

/**
 * Run tests
 */
function runTests() {
  const analyzer = new ConfigurationAnalyzer();

  console.log('='.repeat(80));
  console.log('ConfigurationAnalyzer Test Results');
  console.log('='.repeat(80));

  // Test 1
  console.log('\n📋 Test 1: Next.js with Prisma, NextAuth, and AI');
  console.log('-'.repeat(80));
  const result1 = analyzer.analyze(testConfig1);
  console.log('Requirements:', JSON.stringify(result1, null, 2));
  console.log(`\n✅ Detected ${result1.environmentVariables.length} environment variables`);
  result1.environmentVariables.forEach((v) => {
    console.log(`  - ${v.key} (${v.required ? 'required' : 'optional'})`);
  });

  // Test 2
  console.log('\n\n📋 Test 2: Monorepo with Supabase and Redis');
  console.log('-'.repeat(80));
  const result2 = analyzer.analyze(testConfig2);
  console.log('Requirements:', JSON.stringify(result2, null, 2));
  console.log(`\n✅ Detected ${result2.environmentVariables.length} environment variables`);
  result2.environmentVariables.forEach((v) => {
    console.log(`  - ${v.key} (${v.required ? 'required' : 'optional'})`);
  });

  // Test 3
  console.log('\n\n📋 Test 3: Simple React SPA with Clerk');
  console.log('-'.repeat(80));
  const result3 = analyzer.analyze(testConfig3);
  console.log('Requirements:', JSON.stringify(result3, null, 2));
  console.log(`\n✅ Detected ${result3.environmentVariables.length} environment variables`);
  result3.environmentVariables.forEach((v) => {
    console.log(`  - ${v.key} (${v.required ? 'required' : 'optional'})`);
  });

  // Test 4
  console.log('\n\n📋 Test 4: Express API with MongoDB and OpenAI');
  console.log('-'.repeat(80));
  const result4 = analyzer.analyze(testConfig4);
  console.log('Requirements:', JSON.stringify(result4, null, 2));
  console.log(`\n✅ Detected ${result4.environmentVariables.length} environment variables`);
  result4.environmentVariables.forEach((v) => {
    console.log(`  - ${v.key} (${v.required ? 'required' : 'optional'})`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests completed successfully!');
  console.log('='.repeat(80));
}

// Export for manual testing
export { runTests, testConfig1, testConfig2, testConfig3, testConfig4 };

// Uncomment to run tests directly
// runTests();
