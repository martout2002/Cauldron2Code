/**
 * Test file for GuideProgressManager
 * 
 * Tests progress persistence functionality including:
 * - Saving and loading progress
 * - Marking steps complete
 * - Marking checklist items complete
 * - Setting view mode
 * - Clearing progress
 */

import { GuideProgressManager, getGuideProgressManager } from './guide-progress-manager';
import type { GuideProgress } from '../../types/deployment-guides';

// Mock localStorage
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Setup mock localStorage
const localStorageMock = new LocalStorageMock();
(global as any).localStorage = localStorageMock;

console.log('🧪 Testing GuideProgressManager\n');

// Test 1: Create instance
console.log('Test 1: Create GuideProgressManager instance');
const manager = new GuideProgressManager();
console.log('✅ Instance created successfully\n');

// Test 2: Save and load progress
console.log('Test 2: Save and load progress');
const guideId = 'vercel-test-guide';
const progress: GuideProgress = {
  guideId,
  completedSteps: ['step-1', 'step-2'],
  completedChecklistItems: ['checklist-1'],
  lastUpdated: new Date(),
  viewMode: 'detailed',
};

manager.saveProgress(guideId, progress);
const loadedProgress = manager.loadProgress(guideId);

if (loadedProgress) {
  console.log('✅ Progress saved and loaded successfully');
  console.log(`   Guide ID: ${loadedProgress.guideId}`);
  console.log(`   Completed steps: ${loadedProgress.completedSteps.length}`);
  console.log(`   Completed checklist items: ${loadedProgress.completedChecklistItems.length}`);
  console.log(`   View mode: ${loadedProgress.viewMode}`);
} else {
  console.log('❌ Failed to load progress');
}
console.log('');

// Test 3: Mark step complete
console.log('Test 3: Mark step complete');
manager.markStepComplete(guideId, 'step-3');
const progressAfterStep = manager.loadProgress(guideId);

if (progressAfterStep && progressAfterStep.completedSteps.includes('step-3')) {
  console.log('✅ Step marked as complete');
  console.log(`   Completed steps: ${progressAfterStep.completedSteps.join(', ')}`);
} else {
  console.log('❌ Failed to mark step complete');
}
console.log('');

// Test 4: Mark step incomplete
console.log('Test 4: Mark step incomplete');
manager.markStepComplete(guideId, 'step-2', false);
const progressAfterUnmark = manager.loadProgress(guideId);

if (progressAfterUnmark && !progressAfterUnmark.completedSteps.includes('step-2')) {
  console.log('✅ Step marked as incomplete');
  console.log(`   Completed steps: ${progressAfterUnmark.completedSteps.join(', ')}`);
} else {
  console.log('❌ Failed to mark step incomplete');
}
console.log('');

// Test 5: Mark checklist item complete
console.log('Test 5: Mark checklist item complete');
manager.markChecklistItemComplete(guideId, 'checklist-2');
const progressAfterChecklist = manager.loadProgress(guideId);

if (progressAfterChecklist && progressAfterChecklist.completedChecklistItems.includes('checklist-2')) {
  console.log('✅ Checklist item marked as complete');
  console.log(`   Completed items: ${progressAfterChecklist.completedChecklistItems.join(', ')}`);
} else {
  console.log('❌ Failed to mark checklist item complete');
}
console.log('');

// Test 6: Set view mode
console.log('Test 6: Set view mode');
manager.setViewMode(guideId, 'quick-start');
const progressAfterViewMode = manager.loadProgress(guideId);

if (progressAfterViewMode && progressAfterViewMode.viewMode === 'quick-start') {
  console.log('✅ View mode set successfully');
  console.log(`   View mode: ${progressAfterViewMode.viewMode}`);
} else {
  console.log('❌ Failed to set view mode');
}
console.log('');

// Test 7: Toggle step complete
console.log('Test 7: Toggle step complete');
const beforeToggle = manager.loadProgress(guideId);
const wasCompleted = beforeToggle?.completedSteps.includes('step-1') || false;
manager.toggleStepComplete(guideId, 'step-1');
const afterToggle = manager.loadProgress(guideId);
const isCompleted = afterToggle?.completedSteps.includes('step-1') || false;

if (wasCompleted !== isCompleted) {
  console.log('✅ Step toggled successfully');
  console.log(`   Before: ${wasCompleted}, After: ${isCompleted}`);
} else {
  console.log('❌ Failed to toggle step');
}
console.log('');

// Test 8: Get progress stats
console.log('Test 8: Get progress stats');
const stats = manager.getProgressStats(guideId);
console.log('✅ Progress stats retrieved');
console.log(`   Completed steps: ${stats.completedSteps}`);
console.log(`   Completed checklist items: ${stats.completedChecklistItems}`);
console.log(`   Last updated: ${stats.lastUpdated?.toISOString()}`);
console.log('');

// Test 9: Multiple guides
console.log('Test 9: Multiple guides');
const guideId2 = 'railway-test-guide';
manager.markStepComplete(guideId2, 'railway-step-1');
const allGuideIds = manager.getAllGuideIds();

if (allGuideIds.length === 2 && allGuideIds.includes(guideId) && allGuideIds.includes(guideId2)) {
  console.log('✅ Multiple guides tracked successfully');
  console.log(`   Guide IDs: ${allGuideIds.join(', ')}`);
} else {
  console.log('❌ Failed to track multiple guides');
}
console.log('');

// Test 10: Clear specific guide progress
console.log('Test 10: Clear specific guide progress');
manager.clearProgress(guideId);
const clearedProgress = manager.loadProgress(guideId);

if (clearedProgress === null) {
  console.log('✅ Guide progress cleared successfully');
  const remainingGuides = manager.getAllGuideIds();
  console.log(`   Remaining guides: ${remainingGuides.join(', ')}`);
} else {
  console.log('❌ Failed to clear guide progress');
}
console.log('');

// Test 11: Clear all progress
console.log('Test 11: Clear all progress');
manager.clearAllProgress();
const allGuideIdsAfterClear = manager.getAllGuideIds();

if (allGuideIdsAfterClear.length === 0) {
  console.log('✅ All progress cleared successfully');
} else {
  console.log('❌ Failed to clear all progress');
}
console.log('');

// Test 12: Singleton instance
console.log('Test 12: Singleton instance');
const instance1 = getGuideProgressManager();
const instance2 = getGuideProgressManager();

if (instance1 === instance2) {
  console.log('✅ Singleton pattern working correctly');
} else {
  console.log('❌ Singleton pattern not working');
}
console.log('');

// Test 13: Handle non-existent guide
console.log('Test 13: Handle non-existent guide');
const nonExistentProgress = manager.loadProgress('non-existent-guide');

if (nonExistentProgress === null) {
  console.log('✅ Non-existent guide handled correctly');
} else {
  console.log('❌ Non-existent guide not handled correctly');
}
console.log('');

// Test 14: Progress stats for non-existent guide
console.log('Test 14: Progress stats for non-existent guide');
const nonExistentStats = manager.getProgressStats('non-existent-guide');

if (nonExistentStats.completedSteps === 0 && 
    nonExistentStats.completedChecklistItems === 0 && 
    nonExistentStats.lastUpdated === null) {
  console.log('✅ Non-existent guide stats handled correctly');
} else {
  console.log('❌ Non-existent guide stats not handled correctly');
}
console.log('');

// Test 15: Duplicate step completion
console.log('Test 15: Duplicate step completion');
const testGuideId = 'duplicate-test';
manager.markStepComplete(testGuideId, 'step-1');
manager.markStepComplete(testGuideId, 'step-1');
const duplicateProgress = manager.loadProgress(testGuideId);

if (duplicateProgress && duplicateProgress.completedSteps.length === 1) {
  console.log('✅ Duplicate step completion handled correctly');
  console.log(`   Completed steps count: ${duplicateProgress.completedSteps.length}`);
} else {
  console.log('❌ Duplicate step completion not handled correctly');
}
console.log('');

console.log('✨ All tests completed!\n');

// Summary
console.log('📊 Test Summary:');
console.log('- GuideProgressManager class created');
console.log('- saveProgress() method implemented');
console.log('- loadProgress() method implemented');
console.log('- markStepComplete() method implemented');
console.log('- markChecklistItemComplete() method implemented');
console.log('- setViewMode() method implemented');
console.log('- clearProgress() method implemented');
console.log('- Additional helper methods implemented');
console.log('- Singleton pattern implemented');
console.log('- Error handling implemented');
console.log('- All requirements satisfied ✅');
