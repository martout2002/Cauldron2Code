/**
 * Cross-platform compatibility test suite
 * Tests generated scaffolds on different platforms and Node.js versions
 * 
 * Run with: bun run src/lib/generator/__test-cross-platform.ts
 * 
 * This test:
 * - Generates a scaffold with various configurations
 * - Extracts it to a temporary directory
 * - Verifies dependency installation works
 * - Tests development server startup
 * - Validates build process
 * - Checks Node.js 20+ compatibility
 */

import { ScaffoldGenerator } from './scaffold-generator';
import {
  createTempDirectory,
  writeFiles,
  cleanupDirectory,
} from './file-operations';
import { ScaffoldConfig } from '@/types';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

interface TestResult {
  platform: string;
  nodeVersion: string;
  passed: boolean;
  details: {
    dependencyInstall: boolean;
    devServerStart: boolean;
    buildProcess: boolean;
  };
  errors: string[];
}

async function getPlatformInfo(): Promise<{ platform: string; nodeVersion: string }> {
  const platform = os.platform();
  const { stdout } = await execAsync('node --version');
  const nodeVersion = stdout.trim();
  
  return {
    platform: platform === 'darwin' ? 'macOS' : platform === 'win32' ? 'Windows' : 'Linux',
    nodeVersion,
  };
}

async function checkNodeVersion(): Promise<boolean> {
  const { stdout } = await execAsync('node --version');
  const version = stdout.trim().replace('v', '');
  const majorVersion = parseInt(version.split('.')[0] || '0');
  
  console.log(`📌 Node.js version: ${stdout.trim()}`);
  
  if (majorVersion < 20) {
    console.error(`❌ Node.js 20+ required, found ${stdout.trim()}`);
    return false;
  }
  
  console.log('✓ Node.js version is compatible (20+)\n');
  return true;
}

async function testDependencyInstallation(projectDir: string): Promise<boolean> {
  console.log('📦 Testing dependency installation...');
  
  try {
    // Check if package.json exists
    const packageJsonPath = path.join(projectDir, 'package.json');
    await fs.access(packageJsonPath);
    
    // Try npm install
    console.log('   Running npm install...');
    await execAsync('npm install', {
      cwd: projectDir,
      timeout: 120000, // 2 minutes timeout
    });
    
    // Check if node_modules was created
    const nodeModulesPath = path.join(projectDir, 'node_modules');
    await fs.access(nodeModulesPath);
    
    console.log('✓ Dependencies installed successfully\n');
    return true;
  } catch (error: any) {
    console.error(`❌ Dependency installation failed: ${error.message}\n`);
    return false;
  }
}

async function testDevServerStartup(projectDir: string): Promise<boolean> {
  console.log('🚀 Testing development server startup...');
  
  try {
    // Start dev server in background
    console.log('   Starting dev server...');
    const devProcess = exec('npm run dev', {
      cwd: projectDir,
    });
    
    // Wait for server to start (check for port 3000)
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        devProcess.kill();
        reject(new Error('Dev server startup timeout'));
      }, 30000); // 30 seconds timeout
      
      let output = '';
      
      if (devProcess.stdout) {
        devProcess.stdout.on('data', (data) => {
          output += data.toString();
          // Look for common Next.js startup messages
          if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
            clearTimeout(timeout);
            devProcess.kill();
            resolve(true);
          }
        });
      }
      
      if (devProcess.stderr) {
        devProcess.stderr.on('data', (data) => {
          const errorMsg = data.toString();
          // Ignore warnings, only fail on actual errors
          if (errorMsg.includes('Error:') && !errorMsg.includes('Warning:')) {
            clearTimeout(timeout);
            devProcess.kill();
            reject(new Error(errorMsg));
          }
        });
      }
      
      devProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
    
    console.log('✓ Development server started successfully\n');
    return true;
  } catch (error: any) {
    console.error(`❌ Dev server startup failed: ${error.message}\n`);
    return false;
  }
}

async function testBuildProcess(projectDir: string): Promise<boolean> {
  console.log('🔨 Testing build process...');
  
  try {
    console.log('   Running npm run build...');
    await execAsync('npm run build', {
      cwd: projectDir,
      timeout: 180000, // 3 minutes timeout
    });
    
    // Check if .next directory was created
    const nextBuildPath = path.join(projectDir, '.next');
    await fs.access(nextBuildPath);
    
    console.log('✓ Build completed successfully\n');
    return true;
  } catch (error: any) {
    console.error(`❌ Build process failed: ${error.message}\n`);
    return false;
  }
}

async function testScaffoldConfiguration(config: ScaffoldConfig): Promise<TestResult> {
  const platformInfo = await getPlatformInfo();
  const result: TestResult = {
    platform: platformInfo.platform,
    nodeVersion: platformInfo.nodeVersion,
    passed: false,
    details: {
      dependencyInstall: false,
      devServerStart: false,
      buildProcess: false,
    },
    errors: [],
  };
  
  let projectDir: string | null = null;
  
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${config.projectName}`);
    console.log(`Platform: ${result.platform}`);
    console.log(`Node.js: ${result.nodeVersion}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Generate scaffold
    console.log('⚙️  Generating scaffold...');
    const generator = new ScaffoldGenerator(config);
    const scaffoldResult = await generator.generate();
    console.log(`✓ Generated ${scaffoldResult.files.length} files\n`);
    
    // Create project directory
    projectDir = await createTempDirectory(`test-${config.projectName}`);
    await writeFiles(projectDir, scaffoldResult.files);
    console.log(`✓ Project created at: ${projectDir}\n`);
    
    // Run tests
    result.details.dependencyInstall = await testDependencyInstallation(projectDir);
    
    if (result.details.dependencyInstall) {
      result.details.devServerStart = await testDevServerStartup(projectDir);
      result.details.buildProcess = await testBuildProcess(projectDir);
    }
    
    // Overall pass/fail
    result.passed = 
      result.details.dependencyInstall &&
      result.details.devServerStart &&
      result.details.buildProcess;
    
  } catch (error: any) {
    result.errors.push(error.message);
    console.error(`❌ Test failed: ${error.message}\n`);
  } finally {
    // Cleanup
    if (projectDir) {
      console.log('🧹 Cleaning up...');
      await cleanupDirectory(projectDir);
      console.log('✓ Cleanup complete\n');
    }
  }
  
  return result;
}

async function runCrossPlatformTests() {
  console.log('🧪 Cross-Platform Compatibility Test Suite\n');
  console.log('This test will generate scaffolds and verify they work correctly');
  console.log('on your current platform with your Node.js version.\n');
  
  // Check Node.js version first
  const nodeVersionOk = await checkNodeVersion();
  if (!nodeVersionOk) {
    console.error('❌ Node.js version check failed. Please upgrade to Node.js 20+');
    process.exit(1);
  }
  
  // Test configurations
  const testConfigs: ScaffoldConfig[] = [
    // Minimal configuration
    {
      projectName: 'minimal-next',
      description: 'Minimal Next.js project',
      framework: 'next',
      nextjsRouter: 'app',
      auth: 'none',
      database: 'none',
      api: 'rest-fetch',
      styling: 'tailwind',
      shadcn: true,
      colorScheme: 'white',
      deployment: ['vercel'],
      aiTemplate: 'none',
      extras: {
        docker: false,
        githubActions: false,
        redis: false,
        prettier: true,
        husky: false,
      },
    },
    // Full-featured configuration
    {
      projectName: 'fullstack-app',
      description: 'Full-stack application',
      framework: 'next',
      nextjsRouter: 'app',
      auth: 'none', // Simplified to avoid external dependencies
      database: 'none', // Simplified to avoid external dependencies
      api: 'rest-fetch',
      styling: 'tailwind',
      shadcn: true,
      colorScheme: 'purple',
      deployment: ['vercel', 'railway'],
      aiTemplate: 'none', // Simplified to avoid API key requirements
      extras: {
        docker: true,
        githubActions: true,
        redis: false,
        prettier: true,
        husky: false,
      },
    },
  ];
  
  const results: TestResult[] = [];
  
  for (const config of testConfigs) {
    const result = await testScaffoldConfiguration(config);
    results.push(result);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  results.forEach((result, index) => {
    const config = testConfigs[index];
    if (!config) return;
    
    console.log(`Test ${index + 1}: ${config.projectName}`);
    console.log(`Platform: ${result.platform}`);
    console.log(`Node.js: ${result.nodeVersion}`);
    console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  - Dependency Install: ${result.details.dependencyInstall ? '✓' : '✗'}`);
    console.log(`  - Dev Server Start: ${result.details.devServerStart ? '✓' : '✗'}`);
    console.log(`  - Build Process: ${result.details.buildProcess ? '✓' : '✗'}`);
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.join(', ')}`);
    }
    console.log('');
  });
  
  const allPassed = results.every(r => r.passed);
  
  if (allPassed) {
    console.log('✅ All cross-platform tests passed!');
    console.log('\nYour platform is fully compatible with generated scaffolds.');
  } else {
    console.log('❌ Some tests failed.');
    console.log('\nPlease review the errors above and ensure:');
    console.log('  - Node.js 20+ is installed');
    console.log('  - npm is available and working');
    console.log('  - You have sufficient disk space');
    console.log('  - Network connection is stable for dependency downloads');
    process.exit(1);
  }
}

// Run tests
runCrossPlatformTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
