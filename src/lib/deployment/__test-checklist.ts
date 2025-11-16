/**
 * Test file for PostDeploymentChecklistGenerator
 * Run with: bun run src/lib/deployment/__test-checklist.ts
 */

import { PostDeploymentChecklistGenerator } from './checklist-generator';
import type { Deployment } from '@/lib/platforms/types';
import type { ScaffoldConfig } from '@/types';

// Create a test deployment
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

const testDeployment: Deployment = {
  id: 'test-123',
  userId: 'user-456',
  projectName: 'test-app',
  platform: 'vercel',
  status: 'success',
  deploymentUrl: 'https://test-app.vercel.app',
  services: [],
  config: {
    projectName: 'test-app',
    platform: 'vercel',
    scaffoldConfig: testConfig,
    environmentVariables: [
      {
        key: 'DATABASE_URL',
        value: 'postgresql://...',
        description: 'Database connection string',
        required: true,
        sensitive: true,
      },
      {
        key: 'NEXTAUTH_SECRET',
        value: 'secret123',
        description: 'NextAuth secret',
        required: true,
        sensitive: true,
      },
    ],
    services: [],
  },
  buildLogs: [],
  createdAt: new Date(),
  completedAt: new Date(),
  duration: 120000,
};

// Test the generator
console.log('Testing PostDeploymentChecklistGenerator...\n');

const generator = new PostDeploymentChecklistGenerator();
const items = generator.generate(testDeployment);

console.log(`Generated ${items.length} checklist items:\n`);

items.forEach((item, index) => {
  console.log(`${index + 1}. ${item.title} ${item.required ? '(Required)' : '(Optional)'}`);
  console.log(`   ${item.description}`);
  if (item.command) {
    console.log(`   Command: ${item.command}`);
  }
  if (item.links && item.links.length > 0) {
    console.log(`   Links:`);
    item.links.forEach((link) => {
      console.log(`     - ${link.text}: ${link.url}`);
    });
  }
  if (item.action) {
    console.log(`   Action: ${item.action.text} - ${item.action.url}`);
  }
  console.log('');
});

// Test with different configurations
console.log('\n--- Testing with Clerk auth ---\n');
const clerkConfig = { ...testConfig, auth: 'clerk' as const };
const clerkDeployment = {
  ...testDeployment,
  config: { ...testDeployment.config, scaffoldConfig: clerkConfig },
};
const clerkItems = generator.generate(clerkDeployment);
console.log('OAuth item:', clerkItems.find((i) => i.id.includes('clerk'))?.title);

console.log('\n--- Testing with Drizzle database ---\n');
const drizzleConfig = { ...testConfig, database: 'drizzle-postgres' as const };
const drizzleDeployment = {
  ...testDeployment,
  config: { ...testDeployment.config, scaffoldConfig: drizzleConfig },
};
const drizzleItems = generator.generate(drizzleDeployment);
const migrationItem = drizzleItems.find((i) => i.id === 'run-migrations');
console.log('Migration command:', migrationItem?.command);

console.log('\n--- Testing with no AI template ---\n');
const noAiConfig = { ...testConfig, aiTemplate: 'none' as const };
const noAiDeployment = {
  ...testDeployment,
  config: { ...testDeployment.config, scaffoldConfig: noAiConfig },
};
const noAiItems = generator.generate(noAiDeployment);
const hasAiItem = noAiItems.some((i) => i.id === 'ai-api-key');
console.log('Has AI API key item:', hasAiItem);

console.log('\n✓ All tests completed successfully!');
