/**
 * Guide Progress Manager
 * 
 * Manages persistence of deployment guide progress using browser localStorage.
 * Tracks completed steps, checklist items, and view mode preferences.
 */

import { GuideProgress } from '@/types/deployment-guides';
import { getGuideErrorHandler } from './guide-error-handler';

/**
 * Manages deployment guide progress persistence in browser localStorage
 */
export class GuideProgressManager {
  private readonly storageKey = 'deployment-guide-progress';
  private readonly errorHandler = getGuideErrorHandler();

  /**
   * Save progress for a specific guide
   * @param guideId - Unique identifier for the guide
   * @param progress - Progress data to save
   */
  saveProgress(guideId: string, progress: GuideProgress): void {
    try {
      const allProgress = this.getAllProgress();
      allProgress[guideId] = {
        ...progress,
        lastUpdated: new Date(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(allProgress));
    } catch (error) {
      const guideError = this.errorHandler.handleProgressSaveError(
        error as Error,
        { configId: guideId, operation: 'save' }
      );
      this.errorHandler.logError(guideError, { configId: guideId });
      // Fail silently - progress tracking is not critical
      // User can continue using the guide without saved progress
    }
  }

  /**
   * Load progress for a specific guide
   * @param guideId - Unique identifier for the guide
   * @returns Progress data or null if not found
   */
  loadProgress(guideId: string): GuideProgress | null {
    try {
      const allProgress = this.getAllProgress();
      const progress = allProgress[guideId];
      
      if (!progress) {
        return null;
      }

      // Convert lastUpdated back to Date object
      return {
        ...progress,
        lastUpdated: new Date(progress.lastUpdated),
      };
    } catch (error) {
      const guideError = this.errorHandler.handleProgressLoadError(
        error as Error,
        { configId: guideId, operation: 'load' }
      );
      this.errorHandler.logError(guideError, { configId: guideId });
      return null;
    }
  }

  /**
   * Mark a step as complete or incomplete
   * @param guideId - Unique identifier for the guide
   * @param stepId - Unique identifier for the step
   * @param completed - Whether the step is completed (default: true)
   */
  markStepComplete(guideId: string, stepId: string, completed: boolean = true): void {
    try {
      const progress = this.loadProgress(guideId) || this.createDefaultProgress(guideId);

      if (completed) {
        // Add step if not already in the list
        if (!progress.completedSteps.includes(stepId)) {
          progress.completedSteps.push(stepId);
        }
      } else {
        // Remove step from completed list
        progress.completedSteps = progress.completedSteps.filter(id => id !== stepId);
      }

      this.saveProgress(guideId, progress);
    } catch (error) {
      console.error('Failed to mark step complete:', error);
    }
  }

  /**
   * Mark a checklist item as complete or incomplete
   * @param guideId - Unique identifier for the guide
   * @param itemId - Unique identifier for the checklist item
   * @param completed - Whether the item is completed (default: true)
   */
  markChecklistItemComplete(guideId: string, itemId: string, completed: boolean = true): void {
    try {
      const progress = this.loadProgress(guideId) || this.createDefaultProgress(guideId);

      if (completed) {
        // Add item if not already in the list
        if (!progress.completedChecklistItems.includes(itemId)) {
          progress.completedChecklistItems.push(itemId);
        }
      } else {
        // Remove item from completed list
        progress.completedChecklistItems = progress.completedChecklistItems.filter(
          id => id !== itemId
        );
      }

      this.saveProgress(guideId, progress);
    } catch (error) {
      console.error('Failed to mark checklist item complete:', error);
    }
  }

  /**
   * Set the view mode preference for a guide
   * @param guideId - Unique identifier for the guide
   * @param mode - View mode ('quick-start' or 'detailed')
   */
  setViewMode(guideId: string, mode: 'quick-start' | 'detailed'): void {
    try {
      const progress = this.loadProgress(guideId) || this.createDefaultProgress(guideId);
      progress.viewMode = mode;
      this.saveProgress(guideId, progress);
    } catch (error) {
      console.error('Failed to set view mode:', error);
    }
  }

  /**
   * Clear all progress for a specific guide
   * @param guideId - Unique identifier for the guide
   */
  clearProgress(guideId: string): void {
    try {
      const allProgress = this.getAllProgress();
      delete allProgress[guideId];
      localStorage.setItem(this.storageKey, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Failed to clear guide progress:', error);
    }
  }

  /**
   * Clear all progress for all guides
   */
  clearAllProgress(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear all progress:', error);
    }
  }

  /**
   * Get all guide IDs that have saved progress
   * @returns Array of guide IDs
   */
  getAllGuideIds(): string[] {
    try {
      const allProgress = this.getAllProgress();
      return Object.keys(allProgress);
    } catch (error) {
      console.error('Failed to get all guide IDs:', error);
      return [];
    }
  }

  /**
   * Get progress statistics for a guide
   * @param guideId - Unique identifier for the guide
   * @returns Statistics about the guide progress
   */
  getProgressStats(guideId: string): {
    completedSteps: number;
    completedChecklistItems: number;
    lastUpdated: Date | null;
  } {
    const progress = this.loadProgress(guideId);
    
    if (!progress) {
      return {
        completedSteps: 0,
        completedChecklistItems: 0,
        lastUpdated: null,
      };
    }

    return {
      completedSteps: progress.completedSteps.length,
      completedChecklistItems: progress.completedChecklistItems.length,
      lastUpdated: progress.lastUpdated,
    };
  }

  /**
   * Toggle a step's completion status
   * @param guideId - Unique identifier for the guide
   * @param stepId - Unique identifier for the step
   */
  toggleStepComplete(guideId: string, stepId: string): void {
    const progress = this.loadProgress(guideId);
    const isCompleted = progress?.completedSteps.includes(stepId) || false;
    this.markStepComplete(guideId, stepId, !isCompleted);
  }

  /**
   * Toggle a checklist item's completion status
   * @param guideId - Unique identifier for the guide
   * @param itemId - Unique identifier for the checklist item
   */
  toggleChecklistItemComplete(guideId: string, itemId: string): void {
    const progress = this.loadProgress(guideId);
    const isCompleted = progress?.completedChecklistItems.includes(itemId) || false;
    this.markChecklistItemComplete(guideId, itemId, !isCompleted);
  }

  /**
   * Get all progress data from localStorage
   * @private
   */
  private getAllProgress(): Record<string, GuideProgress> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse stored progress:', error);
      return {};
    }
  }

  /**
   * Create default progress object for a new guide
   * @private
   */
  private createDefaultProgress(guideId: string): GuideProgress {
    return {
      guideId,
      completedSteps: [],
      completedChecklistItems: [],
      lastUpdated: new Date(),
      viewMode: 'detailed',
    };
  }
}

/**
 * Singleton instance of GuideProgressManager
 */
let guideProgressManagerInstance: GuideProgressManager | null = null;

/**
 * Get the singleton instance of GuideProgressManager
 * @returns GuideProgressManager instance
 */
export function getGuideProgressManager(): GuideProgressManager {
  if (!guideProgressManagerInstance) {
    guideProgressManagerInstance = new GuideProgressManager();
  }
  return guideProgressManagerInstance;
}
