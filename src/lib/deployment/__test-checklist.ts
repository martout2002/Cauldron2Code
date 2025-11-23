/**
 * Test file for ChecklistGenerator
 * 
 * This file verifies that the ChecklistGenerator correctly creates
 * post-deployment checklist items based on different configurations.
 */

import { ChecklistGenerator } from './checklist-generator';
import { ConfigurationAnalyzer } from './configuration-analyzer';
import { PLATFORMS } from './platforms';
import { ScaffoldConfig } from '@/types';

// Test configuration with NextAuth
const nextAuthConfig: ScaffoldConfig = {
  projectName: 'test-app',
  frontendFramework: 'nextjs',
  backendFramework: 'none',
  database: 'postgres-prisma',
  auth: 'nextauth',
  styling: 'tailwind',
  aiTemplate: 'none',
  buildTool: 'npm',
  projectStructure: 'single-app',
  extras: {
    docker: false,
    githubActions: false,
    prettier: true,
    husky: false,
    redis: false,
  },
};

// Test configuration with AI
const aiConfig: ScaffoldConfig = {
  projectName: 'ai-app',
  frontendFramework: 'nextjs',
  backendFramework: 'none',
  database: 'none',
  auth: 'none',
  styling: 'tailwind',
  aiTemplate: 'chatbot',
  aiProvider: 'anthropic',
  buildTool: 'npm',
  projectStructure: 'single-app',
  extras: {
    docker: false,
    githubActions: false,
    prettier: true,
    husky: false,
    redis: false,
  },
};

// Test configuration with database only
const databaseConfig: ScaffoldConfig = {
  projectName: 'db-app',
  frontendFramework: 'nextjs',
  backendFramework: 'none',
  database: 'postgres-drizzle',
  auth: 'none',
  styling: 'tailwind',
  aiTemplate: 'none',
  buildTool: 'npm',
  projectStructure: 'single-app',
  extras: {
    docker: false,
    githubActions: false,
    prettier: true,
    husky: false,
    redis: false,
  },
};

// Test configuration with minimal setup
const minimalConfig: ScaffoldConfig = {
  projectName: 'minimal-app',
  frontendFramework: 'nextjs',
  backendFramework: 'none',
  database: 'none',
  auth: 'none',
  styling: 'tailwind',
  aiTemplate: 'none',
  buildTool: 'npm',
  projectStructure: 'single-app',
  extras: {
    docker: false,
    githubActions: false,
    prettier: true,
    husky: false,
    redis: false,
  },
};

function testChecklistGenerator() {
  const generator = new ChecklistGenerator();
  const analyzer = new ConfigurationAnalyzer();
  const vercel = PLATFORMS.find(p => p.id === 'vercel')!;
  const railway = PLATFORMS.find(p => p.id === 'railway')!;

  console.log('=== ChecklistGenerator Tests ===\n');

  // Test 1: NextAuth configuration
  console.log('Test 1: NextAuth Configuration');
  const nextAuthRequirements = analyzer.analyze(nextAuthConfig);
  const nextAuthChecklist = generator.generate(vercel, nextAuthRequirements, nextAuthConfig);
  console.log(`Generated ${nextAuthChecklist.length} checklist items`);
  console.log('Items:', nextAuthChecklist.map(item => item.title));
  
  // Verify OAuth callback item exists
  const oauthItem = nextAuthChecklist.find(item => item.id === 'oauth-callbacks');
  console.log('✓ OAuth callback item:', oauthItem ? 'Found' : 'Missing');
  if (oauthItem) {
    console.log('  - Required:', oauthItem.required);
    console.log('  - External links:', oauthItem.externalLinks?.length || 0);
  }
  
  // Verify database migration item exists
  const migrationItem = nextAuthChecklist.find(item => item.id === 'database-migrations');
  console.log('✓ Database migration item:', migrationItem ? 'Found' : 'Missing');
  if (migrationItem) {
    console.log('  - Required:', migrationItem.required);
    console.log('  - Commands:', migrationItem.commands?.length || 0);
    if (migrationItem.commands && migrationItem.commands.length > 0) {
      console.log('  - Command:', migrationItem.commands[0].command);
    }
  }
  console.log();

  // Test 2: AI configuration
  console.log('Test 2: AI Configuration');
  const aiRequirements = analyzer.analyze(aiConfig);
  const aiChecklist = generator.generate(vercel, aiRequirements, aiConfig);
  console.log(`Generated ${aiChecklist.length} checklist items`);
  
  // Verify AI verification item exists
  const aiItem = aiChecklist.find(item => item.id === 'verify-ai-keys');
  console.log('✓ AI verification item:', aiItem ? 'Found' : 'Missing');
  if (aiItem) {
    console.log('  - Required:', aiItem.required);
    console.log('  - External links:', aiItem.externalLinks?.length || 0);
  }
  console.log();

  // Test 3: Database with Railway (has remote command support)
  console.log('Test 3: Database with Railway');
  const dbRequirements = analyzer.analyze(databaseConfig);
  const railwayChecklist = generator.generate(railway, dbRequirements, databaseConfig);
  const railwayMigration = railwayChecklist.find(item => item.id === 'database-migrations');
  console.log('✓ Database migration item:', railwayMigration ? 'Found' : 'Missing');
  if (railwayMigration && railwayMigration.commands) {
    console.log('  - Commands:', railwayMigration.commands.length);
    railwayMigration.commands.forEach((cmd, idx) => {
      console.log(`  - Command ${idx + 1}:`, cmd.command);
    });
  }
  console.log();

  // Test 4: Minimal configuration
  console.log('Test 4: Minimal Configuration');
  const minimalRequirements = analyzer.analyze(minimalConfig);
  const minimalChecklist = generator.generate(vercel, minimalRequirements, minimalConfig);
  console.log(`Generated ${minimalChecklist.length} checklist items`);
  console.log('Items:', minimalChecklist.map(item => item.title));
  
  // Verify required vs optional items
  const requiredItems = minimalChecklist.filter(item => item.required);
  const optionalItems = minimalChecklist.filter(item => !item.required);
  console.log('✓ Required items:', requiredItems.length);
  console.log('✓ Optional items:', optionalItems.length);
  console.log();

  // Test 5: Verify all checklist items have required fields
  console.log('Test 5: Checklist Item Structure Validation');
  const allChecklists = [nextAuthChecklist, aiChecklist, railwayChecklist, minimalChecklist];
  let structureValid = true;
  
  allChecklists.forEach((checklist, idx) => {
    checklist.forEach(item => {
      if (!item.id || !item.title || !item.description || item.required === undefined) {
        console.log(`✗ Invalid item structure in checklist ${idx + 1}:`, item.id);
        structureValid = false;
      }
    });
  });
  
  if (structureValid) {
    console.log('✓ All checklist items have valid structure');
  }
  console.log();

  // Test 6: Verify standard items are always present
  console.log('Test 6: Standard Items Presence');
  const testApplicationItem = minimalChecklist.find(item => item.id === 'test-application');
  console.log('✓ Test application item:', testApplicationItem ? 'Found' : 'Missing');
  
  const monitoringItem = minimalChecklist.find(item => item.id === 'setup-monitoring');
  console.log('✓ Monitoring item:', monitoringItem ? 'Found' : 'Missing');
  
  const customDomainItem = minimalChecklist.find(item => item.id === 'custom-domain');
  console.log('✓ Custom domain item:', customDomainItem ? 'Found' : 'Missing');
  console.log();

  console.log('=== All Tests Complete ===');
}

// Run tests
testChecklistGenerator();
