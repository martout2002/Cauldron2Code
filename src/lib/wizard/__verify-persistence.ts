/**
 * Verification script for wizard state persistence
 * 
 * This script can be run in the browser console to verify that
 * state persistence is working correctly.
 * 
 * Usage:
 * 1. Navigate to /configure
 * 2. Open browser console
 * 3. Copy and paste this script
 * 4. Run: verifyPersistence()
 */

import {
  hasPersistedWizardState,
  hasPersistedConfigState,
  getPersistedWizardState,
  getPersistedConfigState,
  validatePersistedState,
  getPersistedStateSummary,
} from './wizard-persistence';

export function verifyPersistence() {
  console.log('=== Wizard State Persistence Verification ===\n');

  // Check 1: Storage keys exist
  console.log('1. Checking storage keys...');
  const hasWizard = hasPersistedWizardState();
  const hasConfig = hasPersistedConfigState();
  
  console.log(`   Wizard state: ${hasWizard ? '✓ EXISTS' : '✗ MISSING'}`);
  console.log(`   Config state: ${hasConfig ? '✓ EXISTS' : '✗ MISSING'}`);
  
  if (!hasWizard || !hasConfig) {
    console.log('\n⚠️  State not found. Have you started the wizard yet?');
    console.log('   Navigate to /configure and complete at least one step.\n');
    return;
  }

  // Check 2: Validate state structure
  console.log('\n2. Validating state structure...');
  const validation = validatePersistedState();
  
  if (validation.isValid) {
    console.log('   ✓ State structure is valid');
  } else {
    console.log('   ✗ State structure has issues:');
    validation.issues.forEach(issue => {
      console.log(`     - ${issue}`);
    });
  }

  // Check 3: Get state summary
  console.log('\n3. State summary:');
  const summary = getPersistedStateSummary();
  
  console.log(`   Current step: ${summary.currentStep ?? 'N/A'}`);
  console.log(`   Completed steps: ${summary.completedSteps?.length ?? 0}`);
  console.log(`   Project name: ${summary.projectName || 'Not set'}`);
  console.log(`   Frontend: ${summary.frontendFramework || 'Not set'}`);
  console.log(`   Backend: ${summary.backendFramework || 'Not set'}`);

  // Check 4: Detailed state inspection
  console.log('\n4. Detailed state:');
  const wizardState = getPersistedWizardState();
  const configState = getPersistedConfigState();
  
  console.log('   Wizard state:', wizardState);
  console.log('   Config state:', configState);

  // Check 5: Storage size
  console.log('\n5. Storage size:');
  const wizardSize = new Blob([JSON.stringify(wizardState)]).size;
  const configSize = new Blob([JSON.stringify(configState)]).size;
  
  console.log(`   Wizard state: ${wizardSize} bytes`);
  console.log(`   Config state: ${configSize} bytes`);
  console.log(`   Total: ${wizardSize + configSize} bytes`);

  // Summary
  console.log('\n=== Verification Complete ===');
  
  if (validation.isValid && hasWizard && hasConfig) {
    console.log('✓ All checks passed! State persistence is working correctly.\n');
  } else {
    console.log('⚠️  Some checks failed. Review the output above.\n');
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  (window as any).verifyPersistence = verifyPersistence;
  console.log('Verification script loaded. Run verifyPersistence() to check state.');
}
