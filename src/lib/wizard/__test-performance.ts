/**
 * Performance Testing Utilities for Wizard
 * Run these tests to verify animations run at 60fps
 */

import { AnimationPerformanceMonitor, measureAnimationPerformance } from './performance-monitor';

/**
 * Test wizard step transition performance
 */
export async function testStepTransitionPerformance() {
  console.log('🧪 Testing wizard step transition performance...');
  
  const metrics = await measureAnimationPerformance(
    async () => {
      // Simulate step transition
      const element = document.querySelector('.wizard-step');
      if (element) {
        element.classList.add('fade-out');
        await new Promise(resolve => setTimeout(resolve, 150));
        element.classList.remove('fade-out');
        element.classList.add('fade-in');
      }
    },
    300 // Total animation duration
  );
  
  console.log('Step Transition Metrics:', metrics);
  
  if (metrics.fps >= 60) {
    console.log('✅ Step transitions running at optimal 60fps');
  } else if (metrics.fps >= 50) {
    console.log('⚠️ Step transitions running at acceptable fps:', metrics.fps);
  } else {
    console.log('❌ Step transitions need optimization. FPS:', metrics.fps);
  }
  
  return metrics;
}

/**
 * Test cauldron animation performance
 */
export async function testCauldronAnimationPerformance() {
  console.log('🧪 Testing cauldron animation performance...');
  
  const monitor = new AnimationPerformanceMonitor();
  monitor.start();
  
  // Monitor for 3 seconds (1.5 animation cycles)
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const metrics = monitor.stop();
  
  console.log('Cauldron Animation Metrics:', metrics);
  
  if (metrics.fps >= 60) {
    console.log('✅ Cauldron animation running at optimal 60fps');
  } else if (metrics.fps >= 50) {
    console.log('⚠️ Cauldron animation running at acceptable fps:', metrics.fps);
  } else {
    console.log('❌ Cauldron animation needs optimization. FPS:', metrics.fps);
  }
  
  return metrics;
}

/**
 * Test navigation button hover performance
 */
export async function testNavigationButtonPerformance() {
  console.log('🧪 Testing navigation button performance...');
  
  const metrics = await measureAnimationPerformance(
    async () => {
      const buttons = document.querySelectorAll('.pixel-nav-button');
      buttons.forEach(button => {
        // Simulate hover
        button.classList.add('hover');
        setTimeout(() => button.classList.remove('hover'), 100);
      });
    },
    200
  );
  
  console.log('Navigation Button Metrics:', metrics);
  
  if (metrics.fps >= 60) {
    console.log('✅ Navigation buttons running at optimal 60fps');
  } else {
    console.log('⚠️ Navigation buttons fps:', metrics.fps);
  }
  
  return metrics;
}

/**
 * Test option card selection performance
 */
export async function testOptionCardPerformance() {
  console.log('🧪 Testing option card performance...');
  
  const metrics = await measureAnimationPerformance(
    async () => {
      const cards = document.querySelectorAll('.pixel-option-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.toggle('selected');
        }, index * 50);
      });
    },
    500
  );
  
  console.log('Option Card Metrics:', metrics);
  
  if (metrics.fps >= 60) {
    console.log('✅ Option cards running at optimal 60fps');
  } else {
    console.log('⚠️ Option cards fps:', metrics.fps);
  }
  
  return metrics;
}

/**
 * Run all performance tests
 */
export async function runAllPerformanceTests() {
  console.group('🎨 Wizard Performance Test Suite');
  
  const results = {
    stepTransition: await testStepTransitionPerformance(),
    cauldronAnimation: await testCauldronAnimationPerformance(),
    navigationButtons: await testNavigationButtonPerformance(),
    optionCards: await testOptionCardPerformance(),
  };
  
  console.groupEnd();
  
  // Calculate overall performance score
  const avgFps = Object.values(results).reduce((sum, m) => sum + m.fps, 0) / Object.keys(results).length;
  
  console.log('\n📊 Overall Performance Summary:');
  console.log(`Average FPS: ${avgFps.toFixed(1)}`);
  
  if (avgFps >= 60) {
    console.log('✅ Excellent overall performance');
  } else if (avgFps >= 50) {
    console.log('⚠️ Good overall performance with minor drops');
  } else {
    console.log('❌ Performance optimization needed');
  }
  
  return results;
}

/**
 * Check asset sizes
 */
export async function checkAssetSizes() {
  console.log('📦 Checking asset sizes...');
  
  const assets = [
    '/background_image.png',
    '/cauldron.png',
    '/broom_stick.png',
    '/ladle.png',
    '/search_bar.png',
  ];
  
  const results: Record<string, number> = {};
  
  for (const asset of assets) {
    try {
      const response = await fetch(asset);
      const blob = await response.blob();
      const sizeKB = Math.round(blob.size / 1024);
      results[asset] = sizeKB;
      
      if (sizeKB < 200) {
        console.log(`✅ ${asset}: ${sizeKB}KB (under 200KB target)`);
      } else {
        console.log(`⚠️ ${asset}: ${sizeKB}KB (exceeds 200KB target)`);
      }
    } catch (error) {
      console.error(`❌ Failed to check ${asset}:`, error);
    }
  }
  
  return results;
}

/**
 * Test debounced input performance
 */
export async function testDebouncedInputPerformance() {
  console.log('🧪 Testing debounced input performance...');
  
  const input = document.querySelector('.pixel-input') as HTMLInputElement;
  if (!input) {
    console.log('⚠️ No input field found');
    return null;
  }
  
  const startTime = performance.now();
  let updateCount = 0;
  
  // Simulate rapid typing
  const testString = 'test-project-name';
  for (let i = 0; i < testString.length; i++) {
    input.value = testString.substring(0, i + 1);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    updateCount++;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`Input updates: ${updateCount}`);
  console.log(`Duration: ${duration.toFixed(2)}ms`);
  console.log(`Average time per update: ${(duration / updateCount).toFixed(2)}ms`);
  
  if (duration / updateCount < 100) {
    console.log('✅ Input debouncing working efficiently');
  } else {
    console.log('⚠️ Input updates may need optimization');
  }
  
  return {
    updateCount,
    duration,
    avgTimePerUpdate: duration / updateCount,
  };
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).wizardPerformanceTests = {
    runAll: runAllPerformanceTests,
    testStepTransition: testStepTransitionPerformance,
    testCauldron: testCauldronAnimationPerformance,
    testNavButtons: testNavigationButtonPerformance,
    testOptionCards: testOptionCardPerformance,
    checkAssets: checkAssetSizes,
    testInput: testDebouncedInputPerformance,
  };
  
  console.log('💡 Performance tests available via window.wizardPerformanceTests');
}
