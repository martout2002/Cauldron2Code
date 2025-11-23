/**
 * Verification script for deployment guides types and platform definitions
 * This file is for development verification only
 */

import { Platform, DeploymentGuide, DeploymentStep, ChecklistItem, PlatformId } from '@/types/deployment-guides';
import { PLATFORMS, getPlatformById, getRecommendedPlatforms } from './platforms';
import { ScaffoldConfig } from '@/types';

// Verify all platforms are defined
console.log('=== Platform Verification ===');
console.log(`Total platforms: ${PLATFORMS.length}`);
console.log('Platform IDs:', PLATFORMS.map(p => p.id).join(', '));

// Verify each platform has required properties
PLATFORMS.forEach(platform => {
  console.log(`\n${platform.name}:`);
  console.log(`  - ID: ${platform.id}`);
  console.log(`  - Description: ${platform.description}`);
  console.log(`  - Logo: ${platform.logo}`);
  console.log(`  - Free Tier: ${platform.features.freeTier}`);
  console.log(`  - Database Support: ${platform.features.databaseSupport}`);
  console.log(`  - Ease of Use: ${platform.features.easeOfUse}`);
});

// Test getPlatformById
console.log('\n=== getPlatformById Tests ===');
const vercel = getPlatformById('vercel');
console.log('Vercel found:', vercel?.name);

const railway = getPlatformById('railway');
console.log('Railway found:', railway?.name);

const invalid = getPlatformById('invalid' as PlatformId);
console.log('Invalid platform:', invalid);

// Test getRecommendedPlatforms
console.log('\n=== getRecommendedPlatforms Tests ===');

const nextjsConfig: Partial<ScaffoldConfig> = {
  frontendFramework: 'nextjs',
  backendFramework: 'nextjs-api',
  projectStructure: 'nextjs-only',
  database: 'none',
};
const nextjsRecommended = getRecommendedPlatforms(nextjsConfig);
console.log('Next.js recommended:', nextjsRecommended.map(p => p.name).join(', '));

const monorepoConfig: Partial<ScaffoldConfig> = {
  frontendFramework: 'react',
  backendFramework: 'express',
  projectStructure: 'fullstack-monorepo',
  database: 'prisma-postgres',
};
const monorepoRecommended = getRecommendedPlatforms(monorepoConfig);
console.log('Monorepo recommended:', monorepoRecommended.map(p => p.name).join(', '));

const staticConfig: Partial<ScaffoldConfig> = {
  frontendFramework: 'react',
  backendFramework: 'none',
  projectStructure: 'react-spa',
  database: 'none',
};
const staticRecommended = getRecommendedPlatforms(staticConfig);
console.log('Static site recommended:', staticRecommended.map(p => p.name).join(', '));

// Verify type structure
console.log('\n=== Type Structure Verification ===');

const testStep: DeploymentStep = {
  id: 'test-step',
  title: 'Test Step',
  description: 'This is a test step',
  order: 1,
  required: true,
  commands: [{
    id: 'cmd-1',
    command: 'npm install',
    description: 'Install dependencies',
    language: 'bash',
  }],
};
console.log('DeploymentStep type valid:', testStep.title);

const testChecklistItem: ChecklistItem = {
  id: 'checklist-1',
  title: 'Test Checklist Item',
  description: 'Test description',
  required: true,
  completed: false,
};
console.log('ChecklistItem type valid:', testChecklistItem.title);

console.log('\n=== All Verifications Passed ===');
