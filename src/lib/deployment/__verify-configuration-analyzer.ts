/**
 * Verification script for ConfigurationAnalyzer
 * 
 * Run this to verify the ConfigurationAnalyzer implementation
 */

import { ConfigurationAnalyzer } from './configuration-analyzer';
import type { ScaffoldConfig } from '../../types';

// Simple test configuration
const testConfig: ScaffoldConfig = {
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
  aiTemplates: ['chatbot'],
  aiProvider: 'anthropic',
  extras: {
    docker: false,
    githubActions: true,
    redis: false,
    prettier: true,
    husky: false,
  },
};

console.log('🔍 Testing ConfigurationAnalyzer...\n');

const analyzer = new ConfigurationAnalyzer();
const requirements = analyzer.analyze(testConfig);

console.log('✅ Analysis Results:');
console.log('  - Requires Database:', requirements.requiresDatabase);
console.log('  - Database Type:', requirements.databaseType);
console.log('  - Requires Auth:', requirements.requiresAuth);
console.log('  - Auth Provider:', requirements.authProvider);
console.log('  - Requires AI:', requirements.requiresAI);
console.log('  - Requires Redis:', requirements.requiresRedis);
console.log('  - Is Monorepo:', requirements.isMonorepo);
console.log('  - Framework:', requirements.framework);
console.log('  - Build Tool:', requirements.buildTool);
console.log(`  - Environment Variables: ${requirements.environmentVariables.length} detected\n`);

console.log('📋 Environment Variables:');
requirements.environmentVariables.forEach((envVar, index) => {
  console.log(`\n${index + 1}. ${envVar.key}`);
  console.log(`   Description: ${envVar.description}`);
  console.log(`   Required: ${envVar.required}`);
  console.log(`   How to get: ${envVar.howToGet}`);
  if (envVar.link) {
    console.log(`   Link: ${envVar.link}`);
  }
  if (envVar.example) {
    console.log(`   Example: ${envVar.example}`);
  }
});

console.log('\n✅ ConfigurationAnalyzer verification complete!');
