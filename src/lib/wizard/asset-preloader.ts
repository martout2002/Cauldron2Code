/**
 * Asset Preloader for Wizard
 * Preloads images for the next step to ensure smooth transitions
 */

import { getWizardSteps } from './wizard-steps';

/**
 * Preload an image by creating an Image object
 */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  try {
    await Promise.all(srcs.map(preloadImage));
  } catch (error) {
    // Log error but don't throw - preloading is an optimization, not critical
    console.warn('Image preloading failed:', error);
  }
}

/**
 * Get all image assets for a specific step
 */
export function getStepAssets(stepIndex: number): string[] {
  const steps = getWizardSteps();
  const step = steps[stepIndex];
  
  if (!step) return [];
  
  const assets: string[] = [];
  
  // Add option icons if they exist
  if (step.options) {
    step.options.forEach(option => {
      if (option.icon) {
        assets.push(option.icon);
      }
    });
  }
  
  return assets;
}

/**
 * Preload assets for the next step
 */
export async function preloadNextStep(currentStep: number): Promise<void> {
  const steps = getWizardSteps();
  const nextStepIndex = currentStep + 1;
  
  // Don't preload if we're on the last step
  if (nextStepIndex >= steps.length) {
    return;
  }
  
  const assets = getStepAssets(nextStepIndex);
  
  if (assets.length > 0) {
    await preloadImages(assets);
  }
}

/**
 * Preload all critical wizard assets
 * Call this on wizard mount to preload navigation icons and common assets
 */
export async function preloadCriticalAssets(): Promise<void> {
  const criticalAssets = [
    '/broom_stick.png',
    '/ladle.png',
    '/cauldron.png',
    '/search_bar.png',
  ];
  
  await preloadImages(criticalAssets);
}
