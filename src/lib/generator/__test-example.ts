/**
 * Example usage of the ScaffoldGenerator
 * This file demonstrates how to use the generator
 */

import { ScaffoldGenerator } from './scaffold-generator';
import { ScaffoldConfig } from '@/types';

// Example configuration
const exampleConfig: ScaffoldConfig = {
  projectName: 'my-awesome-app',
  description: 'A full-stack application built with Cauldron2Code',
  framework: 'next',
  nextjsRouter: 'app',
  auth: 'nextauth',
  database: 'prisma-postgres',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['vercel'],
  aiTemplate: 'chatbot',
  extras: {
    docker: true,
    githubActions: true,
    redis: false,
    prettier: true,
    husky: false,
  },
};

// Usage example
async function generateScaffold() {
  const generator = new ScaffoldGenerator(exampleConfig);
  const result = await generator.generate();

  console.log('Generated scaffold:');
  console.log(`- Project: ${result.metadata.projectName}`);
  console.log(`- Framework: ${result.metadata.framework}`);
  console.log(`- Total files: ${result.metadata.totalFiles}`);
  console.log(`- Total directories: ${result.metadata.totalDirectories}`);
  console.log('\nDirectories:');
  result.directories.forEach((dir) => console.log(`  - ${dir}`));
  console.log('\nFiles:');
  result.files.forEach((file) => console.log(`  - ${file.path}`));

  return result;
}

// Export for testing
export { generateScaffold, exampleConfig };
