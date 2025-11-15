/**
 * Test Render Configuration Generation
 * 
 * This test verifies that render.yaml is generated correctly
 * for different project configurations.
 */

import { generateRenderConfig } from './templates/config-templates';
import { ScaffoldConfigWithFramework } from '../../types';

// Test 1: Next.js with PostgreSQL
console.log('=== Test 1: Next.js with PostgreSQL ===\n');
const nextjsConfig: ScaffoldConfigWithFramework = {
  projectName: 'my-nextjs-app',
  description: 'A Next.js app with PostgreSQL',
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
  deployment: ['render'],
  aiTemplate: 'none',
  extras: {
    docker: false,
    githubActions: false,
    redis: false,
    prettier: true,
    husky: false,
  },
  framework: 'next',
};

console.log(generateRenderConfig(nextjsConfig));
console.log('\n');

// Test 2: Express API with MongoDB and Redis
console.log('=== Test 2: Express API with MongoDB and Redis ===\n');
const expressConfig: ScaffoldConfigWithFramework = {
  projectName: 'my-express-api',
  description: 'An Express API with MongoDB',
  frontendFramework: 'react',
  backendFramework: 'express',
  buildTool: 'auto',
  projectStructure: 'express-api-only',
  auth: 'none',
  database: 'mongodb',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: false,
  colorScheme: 'purple',
  deployment: ['render'],
  aiTemplate: 'none',
  extras: {
    docker: false,
    githubActions: false,
    redis: true,
    prettier: true,
    husky: false,
  },
  framework: 'express',
};

console.log(generateRenderConfig(expressConfig));
console.log('\n');

// Test 3: Next.js with AI Template (Anthropic)
console.log('=== Test 3: Next.js with AI Template (Anthropic) ===\n');
const aiConfig: ScaffoldConfigWithFramework = {
  projectName: 'my-ai-app',
  description: 'A Next.js app with AI features',
  frontendFramework: 'nextjs',
  backendFramework: 'nextjs-api',
  buildTool: 'auto',
  projectStructure: 'nextjs-only',
  nextjsRouter: 'app',
  auth: 'clerk',
  database: 'supabase',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['render'],
  aiTemplate: 'chatbot',
  aiProvider: 'anthropic',
  extras: {
    docker: false,
    githubActions: false,
    redis: false,
    prettier: true,
    husky: false,
  },
  framework: 'next',
};

console.log(generateRenderConfig(aiConfig));
console.log('\n');

// Test 4: Monorepo with PostgreSQL and Redis
console.log('=== Test 4: Monorepo with PostgreSQL and Redis ===\n');
const monorepoConfig: ScaffoldConfigWithFramework = {
  projectName: 'my-monorepo',
  description: 'A full-stack monorepo',
  frontendFramework: 'nextjs',
  backendFramework: 'express',
  buildTool: 'auto',
  projectStructure: 'fullstack-monorepo',
  nextjsRouter: 'app',
  auth: 'nextauth',
  database: 'drizzle-postgres',
  api: 'trpc',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['render'],
  aiTemplate: 'none',
  extras: {
    docker: true,
    githubActions: true,
    redis: true,
    prettier: true,
    husky: true,
  },
  framework: 'monorepo',
};

console.log(generateRenderConfig(monorepoConfig));
console.log('\n');

// Test 5: Next.js with AWS Bedrock
console.log('=== Test 5: Next.js with AWS Bedrock ===\n');
const bedrockConfig: ScaffoldConfigWithFramework = {
  projectName: 'my-bedrock-app',
  description: 'A Next.js app with AWS Bedrock',
  frontendFramework: 'nextjs',
  backendFramework: 'nextjs-api',
  buildTool: 'auto',
  projectStructure: 'nextjs-only',
  nextjsRouter: 'app',
  auth: 'none',
  database: 'none',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['render'],
  aiTemplate: 'chatbot',
  aiProvider: 'aws-bedrock',
  extras: {
    docker: false,
    githubActions: false,
    redis: false,
    prettier: true,
    husky: false,
  },
  framework: 'next',
};

console.log(generateRenderConfig(bedrockConfig));
console.log('\n');

console.log('✅ All tests completed!');
