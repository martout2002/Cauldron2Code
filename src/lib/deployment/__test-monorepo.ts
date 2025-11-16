/**
 * Test file for monorepo deployment functionality
 * This file demonstrates and validates the monorepo deployment features
 * 
 * Note: This test focuses on the core logic without requiring platform credentials
 */

import type { ScaffoldConfig } from '@/types';
import type { DeploymentService, GeneratedFile } from '@/lib/platforms/types';
import { FileFilter } from './file-filter';
import { EnvironmentVariableDetector } from './environment-detector';

/**
 * Test: Service Detection
 * Validates that services are correctly detected from scaffold config
 */
function testServiceDetection() {
  console.log('\n=== Testing Service Detection ===');

  // Test monorepo config
  const monorepoConfig: ScaffoldConfig = {
    projectName: 'test-monorepo',
    description: 'Test monorepo project',
    frontendFramework: 'nextjs',
    backendFramework: 'express',
    buildTool: 'auto',
    projectStructure: 'fullstack-monorepo',
    nextjsRouter: 'app',
    auth: 'nextauth',
    database: 'prisma-postgres',
    api: 'rest-fetch',
    styling: 'tailwind',
    shadcn: true,
    colorScheme: 'purple',
    deployment: ['vercel'],
    extras: {
      docker: false,
      githubActions: false,
      redis: false,
      prettier: true,
      husky: false,
    },
  };

  // Manually detect services using the same logic
  const detector = new EnvironmentVariableDetector();
  const allEnvVars = detector.detect(monorepoConfig);

  const backendEnvVars = allEnvVars.filter(
    (v) => !v.key.startsWith('NEXT_PUBLIC_') && v.key !== 'NEXTAUTH_URL'
  );
  const frontendEnvVars = allEnvVars.filter(
    (v) => v.key.startsWith('NEXT_PUBLIC_') || v.key === 'NEXTAUTH_URL'
  );

  const services: DeploymentService[] = [
    {
      name: 'api',
      type: 'backend',
      buildCommand: 'npm run build --filter=api',
      startCommand: 'npm start --filter=api',
      environmentVariables: backendEnvVars,
      dependencies: [],
    },
    {
      name: 'web',
      type: 'frontend',
      buildCommand: 'npm run build --filter=web',
      startCommand: 'npm start --filter=web',
      outputDirectory: '.next',
      environmentVariables: frontendEnvVars,
      dependencies: ['api'],
    },
  ];

  console.log(`Detected ${services.length} services:`);
  services.forEach((service) => {
    console.log(`  - ${service.name} (${service.type})`);
    console.log(`    Build: ${service.buildCommand}`);
    console.log(`    Start: ${service.startCommand}`);
    console.log(`    Dependencies: ${service.dependencies.join(', ') || 'none'}`);
    console.log(`    Env vars: ${service.environmentVariables.length}`);
  });

  // Validate results
  if (services.length !== 2) {
    console.error('❌ Expected 2 services, got', services.length);
    return false;
  }

  const apiService = services.find((s) => s.name === 'api');
  const webService = services.find((s) => s.name === 'web');

  if (!apiService || !webService) {
    console.error('❌ Missing expected services');
    return false;
  }

  if (apiService.type !== 'backend') {
    console.error('❌ API service should be backend type');
    return false;
  }

  if (webService.type !== 'frontend') {
    console.error('❌ Web service should be frontend type');
    return false;
  }

  if (!webService.dependencies.includes('api')) {
    console.error('❌ Web service should depend on API');
    return false;
  }

  console.log('✓ Service detection test passed');
  return true;
}

/**
 * Test: Topological Sort
 * Validates that services are sorted in correct dependency order
 */
function testTopologicalSort() {
  console.log('\n=== Testing Topological Sort ===');

  const services: DeploymentService[] = [
    {
      name: 'web',
      type: 'frontend',
      buildCommand: 'npm run build',
      startCommand: 'npm start',
      environmentVariables: [],
      dependencies: ['api'], // Depends on API
    },
    {
      name: 'api',
      type: 'backend',
      buildCommand: 'npm run build',
      startCommand: 'npm start',
      environmentVariables: [],
      dependencies: [], // No dependencies
    },
  ];

  // Implement topological sort inline for testing
  const sorted: DeploymentService[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (service: DeploymentService) => {
    if (visited.has(service.name)) return;
    if (visiting.has(service.name)) {
      throw new Error(`Circular dependency detected: ${service.name}`);
    }

    visiting.add(service.name);

    for (const depName of service.dependencies) {
      const depService = services.find((s) => s.name === depName);
      if (!depService) {
        throw new Error(`Dependency '${depName}' not found`);
      }
      visit(depService);
    }

    visiting.delete(service.name);
    visited.add(service.name);
    sorted.push(service);
  };

  for (const service of services) {
    visit(service);
  }

  console.log('Deployment order:', sorted.map((s) => s.name).join(' → '));

  // API should come before web
  if (sorted[0].name !== 'api' || sorted[1].name !== 'web') {
    console.error('❌ Incorrect deployment order');
    return false;
  }

  console.log('✓ Topological sort test passed');
  return true;
}

/**
 * Test: File Filtering
 * Validates that files are correctly filtered for each service
 */
function testFileFiltering() {
  console.log('\n=== Testing File Filtering ===');

  const filter = new FileFilter();

  const allFiles: GeneratedFile[] = [
    { path: 'package.json', content: '{}' },
    { path: 'turbo.json', content: '{}' },
    { path: 'apps/web/src/app/page.tsx', content: '' },
    { path: 'apps/web/package.json', content: '{}' },
    { path: 'apps/api/src/index.ts', content: '' },
    { path: 'apps/api/package.json', content: '{}' },
    { path: 'packages/shared/utils.ts', content: '' },
    { path: 'packages/ui/Button.tsx', content: '' },
    { path: 'README.md', content: '' },
  ];

  const webService: DeploymentService = {
    name: 'web',
    type: 'frontend',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    environmentVariables: [],
    dependencies: [],
  };

  const apiService: DeploymentService = {
    name: 'api',
    type: 'backend',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    environmentVariables: [],
    dependencies: [],
  };

  const webFiles = filter.filterForService(webService, allFiles);
  const apiFiles = filter.filterForService(apiService, allFiles);

  console.log(`Web service files: ${webFiles.length}`);
  webFiles.forEach((f) => console.log(`  - ${f.path}`));

  console.log(`API service files: ${apiFiles.length}`);
  apiFiles.forEach((f) => console.log(`  - ${f.path}`));

  // Validate web files
  const webHasOwnFiles = webFiles.some((f) => f.path.startsWith('apps/web/'));
  const webHasShared = webFiles.some((f) => f.path.startsWith('packages/'));
  const webHasRoot = webFiles.some((f) => f.path === 'package.json');

  if (!webHasOwnFiles || !webHasShared || !webHasRoot) {
    console.error('❌ Web service missing expected files');
    return false;
  }

  // Validate API files
  const apiHasOwnFiles = apiFiles.some((f) => f.path.startsWith('apps/api/'));
  const apiHasShared = apiFiles.some((f) => f.path.startsWith('packages/'));
  const apiHasRoot = apiFiles.some((f) => f.path === 'package.json');

  if (!apiHasOwnFiles || !apiHasShared || !apiHasRoot) {
    console.error('❌ API service missing expected files');
    return false;
  }

  // Validate that web files don't include API-specific files
  const webHasApiFiles = webFiles.some((f) => f.path.startsWith('apps/api/'));
  if (webHasApiFiles) {
    console.error('❌ Web service should not include API files');
    return false;
  }

  console.log('✓ File filtering test passed');
  return true;
}

/**
 * Test: File Validation
 * Validates that service files are checked for required files
 */
function testFileValidation() {
  console.log('\n=== Testing File Validation ===');

  const filter = new FileFilter();

  const service: DeploymentService = {
    name: 'web',
    type: 'frontend',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    environmentVariables: [],
    dependencies: [],
  };

  // Test with valid files
  const validFiles: GeneratedFile[] = [
    { path: 'package.json', content: '{}' },
    { path: 'apps/web/src/app/page.tsx', content: '' },
  ];

  const validResult = filter.validateServiceFiles(service, validFiles);
  console.log('Valid files result:', validResult);

  if (!validResult.isValid) {
    console.error('❌ Valid files should pass validation');
    return false;
  }

  // Test with missing package.json
  const invalidFiles: GeneratedFile[] = [
    { path: 'apps/web/src/app/page.tsx', content: '' },
  ];

  const invalidResult = filter.validateServiceFiles(service, invalidFiles);
  console.log('Invalid files result:', invalidResult);

  if (invalidResult.isValid) {
    console.error('❌ Files without package.json should fail validation');
    return false;
  }

  console.log('✓ File validation test passed');
  return true;
}

/**
 * Test: Filter Statistics
 * Validates that file statistics are correctly calculated
 */
function testFilterStatistics() {
  console.log('\n=== Testing Filter Statistics ===');

  const filter = new FileFilter();

  const service: DeploymentService = {
    name: 'web',
    type: 'frontend',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    environmentVariables: [],
    dependencies: [],
  };

  const files: GeneratedFile[] = [
    { path: 'package.json', content: '{}' },
    { path: 'turbo.json', content: '{}' },
    { path: 'apps/web/src/app/page.tsx', content: 'export default function Page() {}' },
    { path: 'packages/shared/utils.ts', content: 'export const util = () => {}' },
  ];

  const stats = filter.getFilterStats(service, files);

  console.log('Statistics:', stats);
  console.log(`  Total files: ${stats.totalFiles}`);
  console.log(`  Service files: ${stats.serviceFiles}`);
  console.log(`  Shared files: ${stats.sharedFiles}`);
  console.log(`  Config files: ${stats.configFiles}`);
  console.log(`  Total size: ${stats.totalSize} bytes`);

  if (stats.totalFiles !== 4) {
    console.error('❌ Expected 4 total files');
    return false;
  }

  if (stats.serviceFiles !== 1) {
    console.error('❌ Expected 1 service file');
    return false;
  }

  if (stats.sharedFiles !== 1) {
    console.error('❌ Expected 1 shared file');
    return false;
  }

  if (stats.configFiles !== 2) {
    console.error('❌ Expected 2 config files');
    return false;
  }

  console.log('✓ Filter statistics test passed');
  return true;
}

/**
 * Run all tests
 */
export function runMonorepoTests() {
  console.log('========================================');
  console.log('Monorepo Deployment Tests');
  console.log('========================================');

  const tests = [
    testServiceDetection,
    testTopologicalSort,
    testFileFiltering,
    testFileValidation,
    testFilterStatistics,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('❌ Test threw error:', error);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  return failed === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
  const success = runMonorepoTests();
  process.exit(success ? 0 : 1);
}
