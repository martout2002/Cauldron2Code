/**
 * Wizard persistence utilities
 * 
 * Provides helper functions for managing wizard state persistence,
 * restoration, and validation.
 */

import { ScaffoldConfig } from '@/types';

/**
 * Storage keys for wizard and config state
 */
export const STORAGE_KEYS = {
  WIZARD: 'cauldron2code-wizard',
  CONFIG: 'cauldron2code-config',
} as const;

/**
 * Check if wizard state exists in localStorage
 */
export function hasPersistedWizardState(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.WIZARD) !== null;
}

/**
 * Check if config state exists in localStorage
 */
export function hasPersistedConfigState(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.CONFIG) !== null;
}

/**
 * Get persisted wizard state
 */
export function getPersistedWizardState(): {
  currentStep: number;
  completedSteps: number[];
  stepData: Record<number, any>;
} | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WIZARD);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return parsed.state || null;
  } catch (error) {
    console.error('Failed to parse persisted wizard state:', error);
    return null;
  }
}

/**
 * Get persisted config state
 */
export function getPersistedConfigState(): { config: ScaffoldConfig } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return parsed.state || null;
  } catch (error) {
    console.error('Failed to parse persisted config state:', error);
    return null;
  }
}

/**
 * Clear all persisted wizard and config state
 * Useful for testing or resetting the wizard
 */
export function clearPersistedState(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.WIZARD);
  localStorage.removeItem(STORAGE_KEYS.CONFIG);
}

/**
 * Validate that persisted state is consistent
 * Returns true if state is valid, false otherwise
 */
export function validatePersistedState(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  const wizardState = getPersistedWizardState();
  const configState = getPersistedConfigState();
  
  // Check if both states exist
  if (!wizardState && configState) {
    issues.push('Config state exists but wizard state is missing');
  }
  
  if (wizardState && !configState) {
    issues.push('Wizard state exists but config state is missing');
  }
  
  // Validate wizard state structure
  if (wizardState) {
    if (typeof wizardState.currentStep !== 'number') {
      issues.push('Invalid currentStep in wizard state');
    }
    
    if (!Array.isArray(wizardState.completedSteps)) {
      issues.push('Invalid completedSteps in wizard state');
    }
    
    if (typeof wizardState.stepData !== 'object') {
      issues.push('Invalid stepData in wizard state');
    }
  }
  
  // Validate config state structure
  if (configState) {
    if (!configState.config || typeof configState.config !== 'object') {
      issues.push('Invalid config structure');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Get a summary of persisted state for debugging
 */
export function getPersistedStateSummary(): {
  hasWizardState: boolean;
  hasConfigState: boolean;
  currentStep?: number;
  completedSteps?: number[];
  projectName?: string;
  frontendFramework?: string;
  backendFramework?: string;
} {
  const wizardState = getPersistedWizardState();
  const configState = getPersistedConfigState();
  
  return {
    hasWizardState: wizardState !== null,
    hasConfigState: configState !== null,
    currentStep: wizardState?.currentStep,
    completedSteps: wizardState?.completedSteps,
    projectName: configState?.config.projectName,
    frontendFramework: configState?.config.frontendFramework,
    backendFramework: configState?.config.backendFramework,
  };
}

/**
 * Export state for backup or migration
 */
export function exportState(): string {
  const wizardState = getPersistedWizardState();
  const configState = getPersistedConfigState();
  
  return JSON.stringify(
    {
      wizard: wizardState,
      config: configState,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

/**
 * Import state from backup
 */
export function importState(jsonString: string): {
  success: boolean;
  error?: string;
} {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not in browser environment' };
  }
  
  try {
    const data = JSON.parse(jsonString);
    
    if (data.wizard) {
      localStorage.setItem(
        STORAGE_KEYS.WIZARD,
        JSON.stringify({ state: data.wizard, version: 1 })
      );
    }
    
    if (data.config) {
      localStorage.setItem(
        STORAGE_KEYS.CONFIG,
        JSON.stringify({ state: data.config, version: 1 })
      );
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
