/**
 * Test file for GuideExporter
 * 
 * This file demonstrates and verifies the guide export functionality.
 * Run this file to test markdown export generation.
 */

import { GuideGenerator } from './guide-generator';
import { GuideExporter } from './guide-exporter';
import { PLATFORMS } from './platforms';
import type { ScaffoldConfig } from '@/types';

/**
 * Create a sample scaffold configuration for testing
 */
function createSampleConfig(): ScaffoldConfig {
  return {
    projectName: 'my-awesome-app',
    description: 'A full-stack application with authentication and database',
    frontendFramework: 'nextjs',
    backendFramework: 'none',
    database: 'prisma-postgres',
    auth: 'nextauth',
    styling: 'tailwind',
    shadcn: true,
    api: 'rest-fetch',
    colorScheme: 'purple',
    deployment: ['vercel'],
    buildTool: 'npm',
    projectStructure: 'nextjs-only',
    extras: {
      docker: false,
      githubActions: true,
      prettier: true,
      husky: false,
      redis: false,
    },
    aiTemplate: 'chatbot',
    aiProvider: 'anthropic',
  };
}

/**
 * Test guide export functionality
 */
function testGuideExport() {
  console.log('🧪 Testing Guide Export Functionality\n');

  // Create instances
  const generator = new GuideGenerator();
  const exporter = new GuideExporter();

  // Get Vercel platform
  const vercel = PLATFORMS.find(p => p.id === 'vercel');
  if (!vercel) {
    console.error('❌ Vercel platform not found');
    return;
  }

  // Create sample config
  const config = createSampleConfig();
  console.log('✅ Created sample scaffold configuration');
  console.log(`   Project: ${config.projectName}`);
  console.log(`   Framework: ${config.frontendFramework}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Auth: ${config.auth}`);
  console.log(`   AI: ${config.aiTemplate}\n`);

  // Generate guide
  console.log('📝 Generating deployment guide...');
  const guide = generator.generateGuide(vercel, config);
  console.log(`✅ Generated guide with ${guide.steps.length} steps`);
  console.log(`   Estimated time: ${guide.estimatedTime}`);
  console.log(`   Checklist items: ${guide.postDeploymentChecklist.length}`);
  console.log(`   Troubleshooting issues: ${guide.troubleshooting.commonIssues.length}\n`);

  // Export as markdown
  console.log('📄 Exporting guide as Markdown...');
  const markdown = exporter.exportAsMarkdown(guide);
  console.log(`✅ Generated ${markdown.length} characters of markdown\n`);

  // Show preview of markdown
  console.log('📋 Markdown Preview (first 500 characters):');
  console.log('─'.repeat(60));
  console.log(markdown.substring(0, 500) + '...');
  console.log('─'.repeat(60));
  console.log('');

  // Verify markdown structure
  console.log('🔍 Verifying markdown structure:');
  const hasTitle = markdown.includes('# Deploy to Vercel');
  const hasSteps = markdown.includes('## Deployment Steps');
  const hasChecklist = markdown.includes('## Post-Deployment Checklist');
  const hasTroubleshooting = markdown.includes('## Troubleshooting');
  const hasTableOfContents = markdown.includes('## Table of Contents');

  console.log(`   ${hasTitle ? '✅' : '❌'} Title present`);
  console.log(`   ${hasTableOfContents ? '✅' : '❌'} Table of contents present`);
  console.log(`   ${hasSteps ? '✅' : '❌'} Deployment steps section present`);
  console.log(`   ${hasChecklist ? '✅' : '❌'} Post-deployment checklist present`);
  console.log(`   ${hasTroubleshooting ? '✅' : '❌'} Troubleshooting section present`);

  // Count code blocks
  const codeBlockCount = (markdown.match(/```/g) || []).length / 2;
  console.log(`   ℹ️  Code blocks: ${codeBlockCount}`);

  // Count links
  const linkCount = (markdown.match(/\[.*?\]\(.*?\)/g) || []).length;
  console.log(`   ℹ️  Links: ${linkCount}`);

  console.log('\n✨ Guide export test completed successfully!');
}

/**
 * Test export with different platforms
 */
function testMultiplePlatforms() {
  console.log('\n🧪 Testing Export with Multiple Platforms\n');

  const generator = new GuideGenerator();
  const exporter = new GuideExporter();
  const config = createSampleConfig();

  const platformsToTest = ['vercel', 'railway', 'render'];

  for (const platformId of platformsToTest) {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) continue;

    console.log(`📝 Generating guide for ${platform.name}...`);
    const guide = generator.generateGuide(platform, config);
    const markdown = exporter.exportAsMarkdown(guide);
    
    console.log(`   ✅ ${platform.name}: ${markdown.length} chars, ${guide.steps.length} steps`);
  }

  console.log('\n✨ Multi-platform export test completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testGuideExport();
  testMultiplePlatforms();
}

export { testGuideExport, testMultiplePlatforms };
