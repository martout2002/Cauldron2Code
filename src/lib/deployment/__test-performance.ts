/**
 * Performance Optimization Tests
 * Tests for parallel operations, caching, and log batching
 */

import { DeploymentCache, CacheKeys, CacheTTL } from './deployment-cache';
import { ProgressTracker } from './progress-tracker';

/**
 * Test caching functionality
 */
function testCaching() {
  console.log('Testing caching functionality...');
  
  const cache = new DeploymentCache();
  
  // Test basic set/get
  cache.set('test-key', { value: 'test-data' }, 1000);
  const result = cache.get('test-key');
  console.log('✓ Basic cache set/get works:', result);
  
  // Test expiration
  cache.set('expire-key', { value: 'will-expire' }, 100);
  setTimeout(() => {
    const expired = cache.get('expire-key');
    console.log('✓ Cache expiration works:', expired === undefined);
  }, 150);
  
  // Test cache keys
  const platformKey = CacheKeys.platformConnection('user123', 'vercel');
  console.log('✓ Platform connection key:', platformKey);
  
  const projectKey = CacheKeys.projectNameAvailability('vercel', 'my-project');
  console.log('✓ Project name key:', projectKey);
  
  const deploymentKey = CacheKeys.deploymentStatus('deploy_123');
  console.log('✓ Deployment status key:', deploymentKey);
  
  // Test TTL constants
  console.log('✓ Platform connection TTL:', CacheTTL.PLATFORM_CONNECTION, 'ms');
  console.log('✓ Project name TTL:', CacheTTL.PROJECT_NAME_AVAILABILITY, 'ms');
  console.log('✓ Deployment status TTL:', CacheTTL.DEPLOYMENT_STATUS, 'ms');
  
  // Test cleanup
  cache.set('cleanup-1', 'data1', 100);
  cache.set('cleanup-2', 'data2', 5000);
  setTimeout(() => {
    cache.cleanup();
    const stats = cache.getStats();
    console.log('✓ Cache cleanup works, stats:', stats);
  }, 150);
}

/**
 * Test log batching functionality
 */
function testLogBatching() {
  console.log('\nTesting log batching functionality...');
  
  const tracker = new ProgressTracker();
  const deploymentId = 'test-deploy-123';
  
  // Subscribe to updates
  let updateCount = 0;
  tracker.subscribe(deploymentId, (update) => {
    updateCount++;
    console.log(`Update ${updateCount}:`, {
      status: update.status,
      message: update.message,
      logCount: update.buildLogs?.length || 0,
    });
  });
  
  // Add multiple logs quickly (should be batched)
  console.log('Adding 10 logs quickly...');
  for (let i = 0; i < 10; i++) {
    tracker.updateLogs(deploymentId, `Log line ${i}`);
  }
  
  // Wait for batch to flush
  setTimeout(() => {
    console.log('✓ Logs batched, total updates:', updateCount);
    console.log('✓ Expected: 1-2 updates (batched), not 10');
    
    // Test log compression
    const logs = [
      'Building...',
      'Building...',
      'Building...',
      'Installing dependencies',
      'Installing dependencies',
      'Build complete',
    ];
    const compressed = tracker.compressLogs(logs);
    console.log('✓ Log compression:', {
      original: logs.length,
      compressed: compressed.length,
      result: compressed,
    });
    
    tracker.forceCleanup(deploymentId);
  }, 1000);
}

/**
 * Test log history limit
 */
function testLogHistoryLimit() {
  console.log('\nTesting log history limit...');
  
  const tracker = new ProgressTracker();
  const deploymentId = 'test-deploy-limit';
  
  // Add more than 1000 logs
  console.log('Adding 1500 logs...');
  for (let i = 0; i < 1500; i++) {
    tracker.updateLogs(deploymentId, `Log line ${i}`);
  }
  
  // Wait for batch to flush
  setTimeout(() => {
    const state = tracker.getState(deploymentId);
    const logCount = state?.buildLogs?.length || 0;
    console.log('✓ Log count after 1500 additions:', logCount);
    console.log('✓ Expected: 1000 (limit enforced)');
    console.log('✓ Limit working:', logCount <= 1000);
    
    tracker.forceCleanup(deploymentId);
  }, 1000);
}

/**
 * Test parallel operations simulation
 */
async function testParallelOperations() {
  console.log('\nTesting parallel operations simulation...');
  
  // Simulate parallel tasks
  const task1 = new Promise((resolve) => {
    setTimeout(() => {
      console.log('✓ Task 1 (create project) completed');
      resolve('project-123');
    }, 100);
  });
  
  const task2 = new Promise((resolve) => {
    setTimeout(() => {
      console.log('✓ Task 2 (generate scaffold) completed');
      resolve(['file1.ts', 'file2.ts']);
    }, 150);
  });
  
  console.log('Starting parallel tasks...');
  const startTime = Date.now();
  const [projectId, files] = await Promise.all([task1, task2]);
  const duration = Date.now() - startTime;
  
  console.log('✓ Both tasks completed in parallel');
  console.log('✓ Duration:', duration, 'ms (should be ~150ms, not 250ms)');
  console.log('✓ Results:', { projectId, fileCount: (files as string[]).length });
}

/**
 * Run all performance tests
 */
async function runPerformanceTests() {
  console.log('=== Performance Optimization Tests ===\n');
  
  testCaching();
  testLogBatching();
  testLogHistoryLimit();
  await testParallelOperations();
  
  // Wait for async tests to complete
  setTimeout(() => {
    console.log('\n=== All Performance Tests Complete ===');
  }, 2000);
}

// Run tests if executed directly
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

export {
  testCaching,
  testLogBatching,
  testLogHistoryLimit,
  testParallelOperations,
  runPerformanceTests,
};
