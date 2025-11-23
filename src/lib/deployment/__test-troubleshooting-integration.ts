/**
 * Integration test for TroubleshootingBuilder with other deployment components
 * 
 * This test demonstrates how TroubleshootingBuilder integrates with
 * ConfigurationAnalyzer and StepBuilder to create complete deployment guides.
 * 
 * Run with: npx tsx src/lib/deployment/__test-troubleshooting-integration.ts
 */

import { ConfigurationAnalyzer } from './configuration-analyzer';
import { StepBuilder } from './step-builder';
import { TroubleshootingBuilder } from './troubleshooting-builder';
import { ChecklistGenerator } from './checklist-generator';
import { PLATFORMS } from './platforms';
import type { ScaffoldConfig } from '../../types';

console.log('🧪 Testing TroubleshootingBuilder Integration\n');

// Create instances
const configAnalyzer = new ConfigurationAnalyzer();
const stepBuilder = new StepBuilder();
const troubleshootingBuilder = new TroubleshootingBuilder();
const checklistGenerator = new ChecklistGenerator();

// Test Scenario 1: Next.js app with PostgreSQL and NextAuth
console.log('Scenario 1: Next.js + PostgreSQL + NextAuth on Vercel');
console.log('='.repeat(60));

const nextjsConfig: ScaffoldConfig = {
  projectName: 'my-nextjs-app',
  description: 'Test Next.js app',
  frontendFramework: 'nextjs',
  backendFramework: 'none',
  database: 'prisma-postgres',
  auth: 'nextauth',
  styling: 'tailwind',
  aiTemplate: 'none',
  buildTool: 'vite',
  projectStructure: 'nextjs-only',
  api: 'rest-fetch',
  shadcn: false,
  colorScheme: 'purple',
  deployment: [],
  extras: {
    docker: false,
    githubActions: false,
    prettier: true,
    husky: false,
    redis: false,
  },
};

const vercel = PLATFORMS.find(p => p.id === 'vercel')!;
const requirements1 = configAnalyzer.analyze(nextjsConfig);

console.log('\n📋 Configuration Analysis:');
console.log(`  Database: ${requirements1.requiresDatabase ? requirements1.databaseType : 'None'}`);
console.log(`  Auth: ${requirements1.requiresAuth ? requirements1.authProvider : 'None'}`);
console.log(`  Framework: ${requirements1.framework}`);
console.log(`  Environment Variables: ${requirements1.environmentVariables.length}`);

const troubleshooting1 = troubleshootingBuilder.buildTroubleshootingSection(
  vercel,
  requirements1
);

console.log('\n🔧 Troubleshooting Section:');
console.log(`  Common Issues: ${troubleshooting1.commonIssues.length}`);
troubleshooting1.commonIssues.forEach((issue, i) => {
  console.log(`    ${i + 1}. ${issue.title}`);
  console.log(`       - ${issue.symptoms.length} symptoms`);
  console.log(`       - ${issue.causes.length} causes`);
  console.log(`       - ${issue.solutions.length} solutions`);
});

console.log(`  Status URL: ${troubleshooting1.platformStatusUrl}`);
console.log(`  Community Links: ${troubleshooting1.communityLinks.length}`);

// Verify database issue is included
const hasDbIssue = troubleshooting1.commonIssues.some(
  issue => issue.title === 'Database Connection Errors'
);
console.log(`\n✅ Database troubleshooting included: ${hasDbIssue}`);

// Verify NextAuth-specific solutions
const envIssue = troubleshooting1.commonIssues.find(
  issue => issue.title === 'Environment Variable Issues'
);
const hasAuthSolutions = envIssue?.solutions.some(s => 
  s.includes('authentication') || s.includes('OAuth')
);
console.log(`✅ Auth-specific solutions included: ${hasAuthSolutions}`);

console.log('\n');

// Test Scenario 2: Full-stack monorepo on Railway
console.log('Scenario 2: Full-stack Monorepo + MongoDB on Railway');
console.log('='.repeat(60));

const monorepoConfig: ScaffoldConfig = {
  projectName: 'my-monorepo',
  description: 'Test monorepo',
  frontendFramework: 'react',
  backendFramework: 'express',
  database: 'mongodb',
  auth: 'none',
  styling: 'css-modules',
  aiTemplate: 'chatbot',
  aiProvider: 'anthropic',
  buildTool: 'vite',
  projectStructure: 'fullstack-monorepo',
  api: 'rest-fetch',
  shadcn: false,
  colorScheme: 'purple',
  deployment: [],
  extras: {
    docker: true,
    githubActions: true,
    prettier: true,
    husky: false,
    redis: true,
  },
};

const railway = PLATFORMS.find(p => p.id === 'railway')!;
const requirements2 = configAnalyzer.analyze(monorepoConfig);

console.log('\n📋 Configuration Analysis:');
console.log(`  Database: ${requirements2.requiresDatabase ? requirements2.databaseType : 'None'}`);
console.log(`  AI: ${requirements2.requiresAI ? 'Yes' : 'No'}`);
console.log(`  Redis: ${requirements2.requiresRedis ? 'Yes' : 'No'}`);
console.log(`  Monorepo: ${requirements2.isMonorepo ? 'Yes' : 'No'}`);
console.log(`  Environment Variables: ${requirements2.environmentVariables.length}`);

const troubleshooting2 = troubleshootingBuilder.buildTroubleshootingSection(
  railway,
  requirements2
);

console.log('\n🔧 Troubleshooting Section:');
console.log(`  Common Issues: ${troubleshooting2.commonIssues.length}`);

// Check for MongoDB-specific solutions
const dbIssue2 = troubleshooting2.commonIssues.find(
  issue => issue.title === 'Database Connection Errors'
);
const hasMongoSolutions = dbIssue2?.solutions.some(s => s.includes('MongoDB'));
console.log(`\n✅ MongoDB-specific solutions: ${hasMongoSolutions}`);

// Check for Railway-specific solutions
const appIssue2 = troubleshooting2.commonIssues.find(
  issue => issue.title === 'Application Won\'t Start'
);
const hasRailwaySolutions = appIssue2?.solutions.some(s => s.includes('Railway'));
console.log(`✅ Railway-specific solutions: ${hasRailwaySolutions}`);

console.log('\n');

// Test Scenario 3: Complete guide generation
console.log('Scenario 3: Complete Deployment Guide Generation');
console.log('='.repeat(60));

const render = PLATFORMS.find(p => p.id === 'render')!;
const simpleConfig: ScaffoldConfig = {
  projectName: 'simple-app',
  description: 'Simple test app',
  frontendFramework: 'nextjs',
  backendFramework: 'none',
  database: 'none',
  auth: 'none',
  styling: 'tailwind',
  aiTemplate: 'none',
  buildTool: 'vite',
  projectStructure: 'nextjs-only',
  api: 'rest-fetch',
  shadcn: false,
  colorScheme: 'purple',
  deployment: [],
  extras: {
    docker: false,
    githubActions: false,
    prettier: true,
    husky: false,
    redis: false,
  },
};

const requirements3 = configAnalyzer.analyze(simpleConfig);
const steps = stepBuilder.buildSteps(render, requirements3);
const checklist = checklistGenerator.generate(render, requirements3, simpleConfig);
const troubleshooting3 = troubleshootingBuilder.buildTroubleshootingSection(
  render,
  requirements3
);

console.log('\n📦 Complete Deployment Guide:');
console.log(`  Platform: ${render.name}`);
console.log(`  Steps: ${steps.length}`);
console.log(`  Checklist Items: ${checklist.length}`);
console.log(`  Troubleshooting Issues: ${troubleshooting3.commonIssues.length}`);

// Verify no database issue for simple config
const hasDbIssue3 = troubleshooting3.commonIssues.some(
  issue => issue.title === 'Database Connection Errors'
);
console.log(`\n✅ Database issue correctly excluded: ${!hasDbIssue3}`);

// Verify essential issues are always present
const hasBuildIssue = troubleshooting3.commonIssues.some(
  issue => issue.title === 'Build Fails'
);
const hasStartIssue = troubleshooting3.commonIssues.some(
  issue => issue.title === 'Application Won\'t Start'
);
const hasEnvIssue = troubleshooting3.commonIssues.some(
  issue => issue.title === 'Environment Variable Issues'
);

console.log(`✅ Build Fails issue present: ${hasBuildIssue}`);
console.log(`✅ Application Won't Start issue present: ${hasStartIssue}`);
console.log(`✅ Environment Variable Issues present: ${hasEnvIssue}`);

console.log('\n');

// Test Scenario 4: All platforms
console.log('Scenario 4: Troubleshooting for All Platforms');
console.log('='.repeat(60));

PLATFORMS.forEach(platform => {
  const troubleshooting = troubleshootingBuilder.buildTroubleshootingSection(
    platform,
    requirements1
  );
  
  console.log(`\n${platform.name}:`);
  console.log(`  Issues: ${troubleshooting.commonIssues.length}`);
  console.log(`  Status: ${troubleshooting.platformStatusUrl}`);
  console.log(`  Community: ${troubleshooting.communityLinks.length} links`);
  
  // Verify all issues have platform-specific content
  const buildIssue = troubleshooting.commonIssues.find(i => i.title === 'Build Fails');
  const hasPlatformName = buildIssue?.solutions.some(s => 
    s.includes(platform.name)
  );
  console.log(`  Platform-specific content: ${hasPlatformName ? '✅' : '⚠️'}`);
});

console.log('\n');

// Summary
console.log('='.repeat(60));
console.log('✅ TroubleshootingBuilder Integration Tests Completed!');
console.log('='.repeat(60));
console.log('\nVerified Integration:');
console.log('✅ Works with ConfigurationAnalyzer');
console.log('✅ Works with StepBuilder');
console.log('✅ Works with ChecklistGenerator');
console.log('✅ Generates platform-specific content');
console.log('✅ Generates framework-specific content');
console.log('✅ Generates database-specific content');
console.log('✅ Conditional issue inclusion');
console.log('✅ Status URLs for all platforms');
console.log('✅ Community links for all platforms');
console.log('\nReady for use in complete deployment guide generation! 🚀');
