/**
 * Manual Test for StepBuilder
 * 
 * This file demonstrates how to use the StepBuilder class
 * to generate deployment steps for different platforms.
 */

import { StepBuilder } from './step-builder';
import { ConfigurationAnalyzer } from './configuration-analyzer';
import { PLATFORMS } from './platforms';
import type { ScaffoldConfig } from '../../types';

// Sample configuration for testing
const sampleConfig: ScaffoldConfig = {
  projectName: 'test-app',
  description: 'A test application',
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
    husky: true,
  },
};

// Test the StepBuilder
function testStepBuilder() {
  console.log('=== Testing StepBuilder ===\n');

  // Initialize analyzer and builder
  const analyzer = new ConfigurationAnalyzer();
  const builder = new StepBuilder();

  // Analyze configuration
  const requirements = analyzer.analyze(sampleConfig);
  console.log('Deployment Requirements:');
  console.log(JSON.stringify(requirements, null, 2));
  console.log('\n');

  // Test with Vercel platform
  const vercelPlatform = PLATFORMS.find(p => p.id === 'vercel');
  if (vercelPlatform) {
    console.log('=== Vercel Deployment Steps ===\n');
    const steps = builder.buildSteps(vercelPlatform, requirements);
    
    steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step.title}`);
      console.log(`   ID: ${step.id}`);
      console.log(`   Required: ${step.required}`);
      if (step.commands && step.commands.length > 0) {
        console.log(`   Commands: ${step.commands.length}`);
      }
      if (step.substeps && step.substeps.length > 0) {
        console.log(`   Substeps: ${step.substeps.length}`);
      }
      console.log('');
    });
  }

  // Test with Railway platform
  const railwayPlatform = PLATFORMS.find(p => p.id === 'railway');
  if (railwayPlatform) {
    console.log('=== Railway Deployment Steps ===\n');
    const steps = builder.buildSteps(railwayPlatform, requirements);
    
    console.log(`Total steps: ${steps.length}`);
    steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step.title} (${step.id})`);
    });
    console.log('');
  }

  // Test monorepo configuration
  const monorepoConfig: ScaffoldConfig = {
    ...sampleConfig,
    projectStructure: 'fullstack-monorepo',
    backendFramework: 'express',
  };

  const monorepoRequirements = analyzer.analyze(monorepoConfig);
  console.log('=== Monorepo Configuration ===');
  console.log(`Is Monorepo: ${monorepoRequirements.isMonorepo}`);
  console.log('');

  if (railwayPlatform) {
    const monorepoSteps = builder.buildMonorepoSteps(
      railwayPlatform,
      monorepoRequirements,
      10
    );
    console.log(`Monorepo-specific steps: ${monorepoSteps.length}`);
    monorepoSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step.title}`);
    });
  }

  console.log('\n=== Test Complete ===');
}

// Run the test
if (require.main === module) {
  testStepBuilder();
}

export { testStepBuilder };
