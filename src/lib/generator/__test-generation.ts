/**
 * Test file for generation API and file operations
 * This is a manual test file - run with: bun run src/lib/generator/__test-generation.ts
 */

import { ScaffoldGenerator } from './scaffold-generator';
import {
  createTempDirectory,
  writeFiles,
  cleanupDirectory,
} from './file-operations';
import {
  generateDownloadId,
  createZipArchive,
  getArchiveStoragePath,
  ensureArchiveStorageDir,
} from './archive-generator';
import { ScaffoldConfig } from '@/types';

async function testGeneration() {
  console.log('🧪 Testing scaffold generation...\n');

  // Test configuration
  const config: ScaffoldConfig = {
    projectName: 'test-project',
    description: 'A test project',
    framework: 'next',
    nextjsRouter: 'app',
    auth: 'none',
    database: 'none',
    api: 'rest-fetch',
    styling: 'tailwind',
    shadcn: true,
    colorScheme: 'purple',
    deployment: ['vercel'],
    aiTemplate: 'none',
    extras: {
      docker: false,
      githubActions: false,
      redis: false,
      prettier: true,
      husky: false,
    },
  };

  let tempDir: string | null = null;

  try {
    // Step 1: Create temp directory
    console.log('📁 Creating temporary directory...');
    tempDir = await createTempDirectory('test-scaffold');
    console.log(`✓ Created: ${tempDir}\n`);

    // Step 2: Generate scaffold
    console.log('⚙️  Generating scaffold...');
    const generator = new ScaffoldGenerator(config);
    const result = await generator.generate();
    console.log(`✓ Generated ${result.files.length} files`);
    console.log(`✓ Created ${result.directories.length} directories\n`);

    // Step 3: Write files
    console.log('💾 Writing files to disk...');
    await writeFiles(tempDir, result.files);
    console.log('✓ Files written successfully\n');

    // Step 4: Create archive
    console.log('📦 Creating zip archive...');
    const downloadId = generateDownloadId();
    await ensureArchiveStorageDir();
    const archivePath = getArchiveStoragePath(downloadId);
    await createZipArchive(tempDir, archivePath, config.projectName);
    console.log(`✓ Archive created: ${archivePath}`);
    console.log(`✓ Download ID: ${downloadId}\n`);

    // Step 5: Cleanup
    console.log('🧹 Cleaning up...');
    await cleanupDirectory(tempDir);
    console.log('✓ Temporary directory cleaned up\n');

    console.log('✅ All tests passed!');
    console.log(`\nArchive location: ${archivePath}`);
    console.log('You can extract and test the generated project.');
  } catch (error) {
    console.error('❌ Test failed:', error);

    // Cleanup on error
    if (tempDir) {
      await cleanupDirectory(tempDir);
    }

    process.exit(1);
  }
}

// Run test
testGeneration();
