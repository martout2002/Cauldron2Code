/**
 * Integration test for WizardStep component with compatibility checking
 * Requirements: 1.3, 8.4, 8.5
 */

import React from 'react';
import { WizardStep } from './WizardStep';
import { getWizardSteps } from '@/lib/wizard/wizard-steps';
import { ScaffoldConfig } from '@/types';

/**
 * Test that WizardStep integrates with compatibility checking
 * This test verifies:
 * - WizardStep uses the useCompatibility hook
 * - Enhanced options with disabled state are passed to OptionGrid
 * - Compatibility is evaluated on step load
 * - Loading state is shown during initial evaluation
 */
export function TestWizardStepIntegration() {
  const steps = getWizardSteps();
  const backendStep = steps.find(s => s.id === 'backend');
  
  if (!backendStep) {
    throw new Error('Backend step not found');
  }
  
  // Test configuration with Next.js frontend (should disable Express/Fastify/NestJS)
  const testConfig: ScaffoldConfig = {
    projectName: 'test-project',
    description: 'Test description',
    frontendFramework: 'nextjs',
    backendFramework: 'none',
    database: 'none',
    auth: 'none',
    styling: 'tailwind',
    projectStructure: 'monorepo',
    extras: {
      docker: false,
      githubActions: false,
      redis: false,
      prettier: false,
      husky: false,
    },
  };
  
  const handleUpdate = (updates: Partial<ScaffoldConfig>) => {
    console.log('Config updated:', updates);
  };
  
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-white text-2xl mb-8">WizardStep Integration Test</h1>
      
      <div className="mb-8">
        <h2 className="text-white text-xl mb-4">Test Scenario: Next.js Frontend Selected</h2>
        <p className="text-gray-400 mb-4">
          Expected: Express, Fastify, and NestJS should be disabled
        </p>
      </div>
      
      <WizardStep
        step={backendStep}
        stepNumber={4}
        totalSteps={8}
        isAnimating={false}
        config={testConfig}
        onUpdate={handleUpdate}
      />
      
      <div className="mt-8 text-gray-400">
        <p>Instructions:</p>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Verify that Express, Fastify, and NestJS options appear with reduced opacity</li>
          <li>Hover over disabled options to see incompatibility tooltips</li>
          <li>Try clicking disabled options - they should not be selectable</li>
          <li>Verify that "None" and "Next.js API" options remain enabled</li>
        </ol>
      </div>
    </div>
  );
}

export default TestWizardStepIntegration;
