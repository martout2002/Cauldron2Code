/**
 * Test file for DocumentationGenerator
 * This file is for development testing only
 */

import { DocumentationGenerator } from './documentation-generator';
import { ScaffoldConfig } from '@/types';

// Test configuration with AI template
const testConfig: ScaffoldConfig = {
  projectName: 'my-awesome-app',
  description: 'A full-stack application with AI capabilities',
  framework: 'monorepo',
  nextjsRouter: 'app',
  auth: 'nextauth',
  database: 'prisma-postgres',
  api: 'trpc',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['vercel', 'railway'],
  aiTemplate: 'chatbot',
  extras: {
    docker: true,
    githubActions: true,
    redis: false,
    prettier: true,
    husky: false,
  },
};

// Create generator instance
const generator = new DocumentationGenerator(testConfig);

// Test README generation
console.log('=== README.md ===');
console.log(generator.generateREADME());
console.log('\n\n');

// Test SETUP.md generation
console.log('=== SETUP.md ===');
console.log(generator.generateSETUP());
console.log('\n\n');

// Test DEPLOYMENT.md generation
console.log('=== DEPLOYMENT.md ===');
console.log(generator.generateDEPLOYMENT());
console.log('\n\n');

// Test .env.example generation
console.log('=== .env.example ===');
console.log(generator.generateEnvExample());
console.log('\n\n');

// Test monorepo docs generation
console.log('=== MONOREPO.md ===');
const monorepoDocs = generator.generateMonorepoDocs();
if (monorepoDocs) {
  console.log(monorepoDocs);
} else {
  console.log('No monorepo documentation (not a monorepo config)');
}
