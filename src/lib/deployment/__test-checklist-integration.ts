/**
 * Integration test showing how ChecklistGenerator works with ConfigurationAnalyzer
 * 
 * This demonstrates the complete flow from scaffold config to checklist generation.
 */

import { ChecklistGenerator } from './checklist-generator';
import { ConfigurationAnalyzer } from './configuration-analyzer';
import { PLATFORMS } from './platforms';
import { ScaffoldConfig } from '@/types';

// Full-featured configuration
const fullStackConfig: ScaffoldConfig = {
  projectName: 'full-stack-app',
  frontendFramework: 'nextjs',
  backendFramework: 'express',
  database: 'postgres-prisma',
  auth: 'nextauth',
  styling: 'tailwind',
  aiTemplate: 'chatbot',
  aiProvider: 'anthropic',
  buildTool: 'npm',
  projectStructure: 'fullstack-monorepo',
  extras: {
    docker: true,
    githubActions: true,
    prettier: true,
    husky: true,
    redis: true,
  },
};

function demonstrateIntegration() {
  console.log('=== ChecklistGenerator Integration Demo ===\n');

  // Step 1: Analyze configuration
  console.log('Step 1: Analyzing scaffold configuration...');
  const analyzer = new ConfigurationAnalyzer();
  const requirements = analyzer.analyze(fullStackConfig);
  
  console.log('Detected requirements:');
  console.log('  - Database:', requirements.requiresDatabase ? requirements.databaseType : 'None');
  console.log('  - Auth:', requirements.requiresAuth ? requirements.authProvider : 'None');
  console.log('  - AI:', requirements.requiresAI ? 'Yes' : 'No');
  console.log('  - Redis:', requirements.requiresRedis ? 'Yes' : 'No');
  console.log('  - Monorepo:', requirements.isMonorepo ? 'Yes' : 'No');
  console.log('  - Environment variables:', requirements.environmentVariables.length);
  console.log();

  // Step 2: Generate checklist for different platforms
  console.log('Step 2: Generating checklists for different platforms...\n');
  const generator = new ChecklistGenerator();

  PLATFORMS.forEach(platform => {
    console.log(`--- ${platform.name} Checklist ---`);
    const checklist = generator.generate(platform, requirements, fullStackConfig);
    
    console.log(`Total items: ${checklist.length}`);
    console.log(`Required: ${checklist.filter(i => i.required).length}`);
    console.log(`Optional: ${checklist.filter(i => !i.required).length}`);
    console.log('\nItems:');
    
    checklist.forEach((item, idx) => {
      const badge = item.required ? '[REQUIRED]' : '[OPTIONAL]';
      console.log(`  ${idx + 1}. ${badge} ${item.title}`);
      
      if (item.commands && item.commands.length > 0) {
        console.log(`     Commands: ${item.commands.length}`);
        item.commands.forEach(cmd => {
          console.log(`       - ${cmd.command}`);
        });
      }
      
      if (item.externalLinks && item.externalLinks.length > 0) {
        console.log(`     Links: ${item.externalLinks.length}`);
      }
    });
    console.log();
  });

  // Step 3: Show how checklist adapts to configuration
  console.log('Step 3: Demonstrating adaptive checklist generation...\n');
  
  const configs = [
    { name: 'Minimal (no auth, no db)', config: { ...fullStackConfig, auth: 'none', database: 'none', aiTemplate: 'none' } },
    { name: 'Auth only', config: { ...fullStackConfig, database: 'none', aiTemplate: 'none' } },
    { name: 'Database only', config: { ...fullStackConfig, auth: 'none', aiTemplate: 'none' } },
    { name: 'AI only', config: { ...fullStackConfig, auth: 'none', database: 'none' } },
  ];

  const vercel = PLATFORMS.find(p => p.id === 'vercel')!;
  
  configs.forEach(({ name, config }) => {
    const reqs = analyzer.analyze(config as ScaffoldConfig);
    const checklist = generator.generate(vercel, reqs, config as ScaffoldConfig);
    
    console.log(`${name}:`);
    console.log(`  Items: ${checklist.length} (${checklist.filter(i => i.required).length} required)`);
    console.log(`  Titles: ${checklist.map(i => i.title).join(', ')}`);
    console.log();
  });

  console.log('=== Integration Demo Complete ===');
}

// Run demonstration
demonstrateIntegration();
