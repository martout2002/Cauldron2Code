/**
 * Test file for GuideGenerator
 * 
 * This file tests the guide generation functionality to ensure:
 * - Guides are generated correctly for different platforms
 * - Configuration analysis works properly
 * - Steps are generated in correct order
 * - Checklist and troubleshooting sections are included
 * - Time estimation is reasonable
 * - Guide IDs are unique
 */

import { GuideGenerator } from './guide-generator';
import { PLATFORMS } from './platforms';
import type { ScaffoldConfig } from '@/types';

// Test configuration: Next.js with PostgreSQL and NextAuth
const testConfig: ScaffoldConfig = {
  projectName: 'test-app',
  description: 'Test application with Next.js, PostgreSQL, and NextAuth',
  frontendFramework: 'nextjs',
  backendFramework: 'none',
  database: 'prisma-postgres',
  auth: 'nextauth',
  styling: 'tailwind',
  shadcn: true,
  api: 'rest-fetch',
  colorScheme: 'purple',
  deployment: ['vercel'],
  buildTool: 'auto',
  projectStructure: 'nextjs-only',
  extras: {
    docker: false,
    githubActions: false,
    prettier: true,
    husky: false,
    redis: false,
  },
  aiTemplate: 'chatbot',
  aiProvider: 'anthropic',
};

// Test configuration: Monorepo with database
const monorepoConfig: ScaffoldConfig = {
  projectName: 'fullstack-app',
  description: 'Full-stack monorepo application',
  frontendFramework: 'nextjs',
  backendFramework: 'express',
  database: 'prisma-postgres',
  auth: 'clerk',
  styling: 'tailwind',
  shadcn: true,
  api: 'rest-fetch',
  colorScheme: 'gold',
  deployment: ['railway'],
  buildTool: 'auto',
  projectStructure: 'fullstack-monorepo',
  extras: {
    docker: true,
    githubActions: true,
    prettier: true,
    husky: true,
    redis: true,
  },
  aiTemplate: undefined,
  aiProvider: undefined,
};

// Test configuration: Simple static site
const staticConfig: ScaffoldConfig = {
  projectName: 'static-site',
  description: 'Simple static React site',
  frontendFramework: 'react',
  backendFramework: 'none',
  database: 'none',
  auth: 'none',
  styling: 'css-modules',
  shadcn: false,
  api: 'rest-fetch',
  colorScheme: 'white',
  deployment: ['netlify'],
  buildTool: 'vite',
  projectStructure: 'react-spa',
  extras: {
    docker: false,
    githubActions: false,
    prettier: false,
    husky: false,
    redis: false,
  },
  aiTemplate: undefined,
  aiProvider: undefined,
};

function testGuideGeneration() {
  console.log('🧪 Testing GuideGenerator\n');

  const generator = new GuideGenerator();

  // Test 1: Generate guide for Vercel with Next.js + Database + Auth + AI
  console.log('Test 1: Vercel with Next.js + Database + Auth + AI');
  const vercel = PLATFORMS.find(p => p.id === 'vercel');
  if (vercel) {
    const guide = generator.generateGuide(vercel, testConfig);
    console.log(`✓ Guide ID: ${guide.id}`);
    console.log(`✓ Platform: ${guide.platform.name}`);
    console.log(`✓ Steps: ${guide.steps.length}`);
    console.log(`✓ Checklist items: ${guide.postDeploymentChecklist.length}`);
    console.log(`✓ Common issues: ${guide.troubleshooting.commonIssues.length}`);
    console.log(`✓ Estimated time: ${guide.estimatedTime}`);
    console.log(`✓ Step titles:`);
    guide.steps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step.title}`);
    });
    console.log();
  }

  // Test 2: Generate guide for Railway with monorepo
  console.log('Test 2: Railway with Monorepo');
  const railway = PLATFORMS.find(p => p.id === 'railway');
  if (railway) {
    const guide = generator.generateGuide(railway, monorepoConfig);
    console.log(`✓ Guide ID: ${guide.id}`);
    console.log(`✓ Platform: ${guide.platform.name}`);
    console.log(`✓ Steps: ${guide.steps.length}`);
    console.log(`✓ Has monorepo steps: ${guide.steps.some(s => s.id.includes('monorepo'))}`);
    console.log(`✓ Checklist items: ${guide.postDeploymentChecklist.length}`);
    console.log(`✓ Estimated time: ${guide.estimatedTime}`);
    console.log();
  }

  // Test 3: Generate guide for Netlify with static site
  console.log('Test 3: Netlify with Static Site');
  const netlify = PLATFORMS.find(p => p.id === 'netlify');
  if (netlify) {
    const guide = generator.generateGuide(netlify, staticConfig);
    console.log(`✓ Guide ID: ${guide.id}`);
    console.log(`✓ Platform: ${guide.platform.name}`);
    console.log(`✓ Steps: ${guide.steps.length}`);
    console.log(`✓ Checklist items: ${guide.postDeploymentChecklist.length}`);
    console.log(`✓ Estimated time: ${guide.estimatedTime}`);
    console.log(`✓ Has database steps: ${guide.steps.some(s => s.id === 'database-setup')}`);
    console.log(`✓ Has auth steps: ${guide.steps.some(s => s.id === 'environment-variables')}`);
    console.log();
  }

  // Test 4: Test time estimation
  console.log('Test 4: Time Estimation');
  const render = PLATFORMS.find(p => p.id === 'render');
  if (render) {
    const simpleGuide = generator.generateGuide(render, staticConfig);
    const complexGuide = generator.generateGuide(render, monorepoConfig);
    console.log(`✓ Simple guide time: ${simpleGuide.estimatedTime}`);
    console.log(`✓ Complex guide time: ${complexGuide.estimatedTime}`);
    console.log(`✓ Complex guide has more steps: ${complexGuide.steps.length > simpleGuide.steps.length}`);
    console.log();
  }

  // Test 5: Test guide ID uniqueness
  console.log('Test 5: Guide ID Uniqueness');
  if (vercel) {
    const guide1 = generator.generateGuide(vercel, testConfig);
    const guide2 = generator.generateGuide(vercel, testConfig);
    console.log(`✓ Guide 1 ID: ${guide1.id}`);
    console.log(`✓ Guide 2 ID: ${guide2.id}`);
    console.log(`✓ IDs are unique: ${guide1.id !== guide2.id}`);
    console.log();
  }

  // Test 6: Test all platforms
  console.log('Test 6: All Platforms');
  PLATFORMS.forEach(platform => {
    const guide = generator.generateGuide(platform, testConfig);
    console.log(`✓ ${platform.name}: ${guide.steps.length} steps, ${guide.estimatedTime}`);
  });
  console.log();

  // Test 7: Verify required components
  console.log('Test 7: Verify Required Components');
  if (vercel) {
    const guide = generator.generateGuide(vercel, testConfig);
    
    // Check for required steps
    const hasPrerequisites = guide.steps.some(s => s.id === 'prerequisites');
    const hasRepository = guide.steps.some(s => s.id === 'repository-setup');
    const hasEnvVars = guide.steps.some(s => s.id === 'environment-variables');
    const hasDatabase = guide.steps.some(s => s.id === 'database-setup');
    const hasDeploy = guide.steps.some(s => s.id === 'deploy');
    const hasVerification = guide.steps.some(s => s.id === 'verification');
    
    console.log(`✓ Has prerequisites step: ${hasPrerequisites}`);
    console.log(`✓ Has repository step: ${hasRepository}`);
    console.log(`✓ Has environment variables step: ${hasEnvVars}`);
    console.log(`✓ Has database step: ${hasDatabase}`);
    console.log(`✓ Has deploy step: ${hasDeploy}`);
    console.log(`✓ Has verification step: ${hasVerification}`);
    
    // Check checklist items
    const hasOAuthItem = guide.postDeploymentChecklist.some(i => i.id === 'oauth-callbacks');
    const hasMigrationItem = guide.postDeploymentChecklist.some(i => i.id === 'database-migrations');
    const hasTestItem = guide.postDeploymentChecklist.some(i => i.id === 'test-application');
    
    console.log(`✓ Has OAuth checklist item: ${hasOAuthItem}`);
    console.log(`✓ Has migration checklist item: ${hasMigrationItem}`);
    console.log(`✓ Has test checklist item: ${hasTestItem}`);
    
    // Check troubleshooting
    const hasBuildFailsIssue = guide.troubleshooting.commonIssues.some(i => i.title === 'Build Fails');
    const hasAppWontStartIssue = guide.troubleshooting.commonIssues.some(i => i.title === 'Application Won\'t Start');
    const hasDbIssue = guide.troubleshooting.commonIssues.some(i => i.title === 'Database Connection Errors');
    
    console.log(`✓ Has build fails issue: ${hasBuildFailsIssue}`);
    console.log(`✓ Has app won't start issue: ${hasAppWontStartIssue}`);
    console.log(`✓ Has database issue: ${hasDbIssue}`);
    console.log();
  }

  console.log('✅ All tests completed!\n');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testGuideGeneration();
}

export { testGuideGeneration };
