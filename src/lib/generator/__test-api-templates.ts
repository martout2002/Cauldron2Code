#!/usr/bin/env bun

/**
 * Test script for API layer templates
 */

import { ScaffoldGenerator } from './scaffold-generator';
import { ScaffoldConfig } from '@/types';

async function testApiTemplates() {
  console.log('🧪 Testing API layer templates...\n');

  const apiTypes = ['rest-fetch', 'rest-axios', 'trpc', 'graphql'] as const;

  for (const apiType of apiTypes) {
    console.log(`\n📋 Testing ${apiType.toUpperCase()} template...`);

    const config: ScaffoldConfig = {
      projectName: `test-${apiType}`,
      description: `Test project with ${apiType}`,
      framework: 'next',
      auth: 'none',
      database: 'none',
      api: apiType,
      styling: 'tailwind',
      shadcn: false,
      colorScheme: 'purple',
      deployment: [],
      extras: {
        docker: false,
        githubActions: false,
        redis: false,
        prettier: false,
        husky: false,
      },
    };

    const generator = new ScaffoldGenerator(config);
    const result = await generator.generate();

    console.log(`  ✓ Generated ${result.files.length} files`);

    // Check for API-specific files
    const apiFiles = result.files.filter((f) =>
      f.path.includes('api') || f.path.includes('trpc') || f.path.includes('graphql')
    );

    console.log(`  ✓ Found ${apiFiles.length} API-related files:`);
    apiFiles.forEach((f) => {
      console.log(`    - ${f.path}`);
    });

    // Verify expected files exist
    let expectedFiles: string[] = [];
    switch (apiType) {
      case 'rest-fetch':
      case 'rest-axios':
        expectedFiles = [
          'src/lib/api-client.ts',
          'src/app/api/users/route.ts',
          'src/app/api/users/[id]/route.ts',
        ];
        break;
      case 'trpc':
        expectedFiles = [
          'src/lib/trpc/router.ts',
          'src/app/api/trpc/[trpc]/route.ts',
          'src/lib/trpc/client.ts',
          'src/lib/trpc/provider.tsx',
        ];
        break;
      case 'graphql':
        expectedFiles = [
          'src/lib/graphql/schema.ts',
          'src/app/api/graphql/route.ts',
          'src/lib/graphql/client.ts',
          'src/lib/graphql/provider.tsx',
          'src/lib/graphql/queries.ts',
        ];
        break;
    }

    const missingFiles = expectedFiles.filter(
      (expected) => !result.files.some((f) => f.path === expected)
    );

    if (missingFiles.length > 0) {
      console.log(`  ❌ Missing expected files:`);
      missingFiles.forEach((f) => console.log(`    - ${f}`));
      process.exit(1);
    } else {
      console.log(`  ✓ All expected files present`);
    }
  }

  console.log('\n✅ All API template tests passed!\n');
}

testApiTemplates().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
