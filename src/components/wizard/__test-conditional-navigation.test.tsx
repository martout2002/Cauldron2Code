/**
 * Integration test for conditional step navigation in the wizard
 * Verifies that the wizard correctly skips conditional steps during navigation
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { 
  getWizardSteps, 
  getVisibleSteps, 
  getNextVisibleStepIndex, 
  getPreviousVisibleStepIndex 
} from '@/lib/wizard/wizard-steps';
import { ScaffoldConfig } from '@/types';

describe('Wizard Conditional Navigation Integration', () => {
  const createConfig = (overrides: Partial<ScaffoldConfig> = {}): ScaffoldConfig => ({
    projectName: 'test-project',
    description: 'Test description',
    frontendFramework: 'nextjs',
    backendFramework: 'none',
    buildTool: 'auto',
    projectStructure: 'nextjs-only',
    auth: 'none',
    database: 'none',
    api: 'rest-fetch',
    styling: 'tailwind',
    shadcn: false,
    colorScheme: 'purple',
    deployment: ['vercel'],
    aiTemplates: [],
    aiProvider: undefined,
    extras: {
      docker: false,
      githubActions: false,
      redis: false,
      prettier: false,
      husky: false,
    },
    ...overrides,
  });

  describe('Complete navigation flow without AI templates', () => {
    it('should navigate through all steps skipping AI provider', () => {
      const config = createConfig({ aiTemplates: [] });
      const allSteps = getWizardSteps();
      const visibleSteps = getVisibleSteps(config);
      
      // Start from first step
      let currentIndex = 0;
      const visitedSteps: string[] = [];
      
      // Navigate forward through all steps
      while (currentIndex !== -1) {
        visitedSteps.push(allSteps[currentIndex].id);
        currentIndex = getNextVisibleStepIndex(currentIndex, config);
      }
      
      // Verify AI provider was skipped
      expect(visitedSteps).not.toContain('ai-provider');
      
      // Verify all other steps were visited
      expect(visitedSteps).toContain('project-name');
      expect(visitedSteps).toContain('ai-templates');
      
      // Verify we visited the correct number of steps
      expect(visitedSteps.length).toBe(visibleSteps.length);
    });
  });

  describe('Complete navigation flow with AI templates', () => {
    it('should navigate through all steps including AI provider', () => {
      const config = createConfig({ aiTemplates: ['chatbot'] });
      const allSteps = getWizardSteps();
      const visibleSteps = getVisibleSteps(config);
      
      // Start from first step
      let currentIndex = 0;
      const visitedSteps: string[] = [];
      
      // Navigate forward through all steps
      while (currentIndex !== -1) {
        visitedSteps.push(allSteps[currentIndex].id);
        currentIndex = getNextVisibleStepIndex(currentIndex, config);
      }
      
      // Verify AI provider was included
      expect(visitedSteps).toContain('ai-provider');
      
      // Verify AI templates was visited before AI provider
      const aiTemplatesIndex = visitedSteps.indexOf('ai-templates');
      const aiProviderIndex = visitedSteps.indexOf('ai-provider');
      expect(aiTemplatesIndex).toBeLessThan(aiProviderIndex);
      
      // Verify we visited the correct number of steps
      expect(visitedSteps.length).toBe(visibleSteps.length);
    });
  });

  describe('Backward navigation', () => {
    it('should navigate backward skipping AI provider when no templates', () => {
      const config = createConfig({ aiTemplates: [] });
      const allSteps = getWizardSteps();
      const visibleSteps = getVisibleSteps(config);
      
      // Start from the last VISIBLE step (not the absolute last step)
      // Find the AI templates step and start from there
      const aiTemplatesIndex = allSteps.findIndex(s => s.id === 'ai-templates');
      let currentIndex = aiTemplatesIndex;
      const visitedSteps: string[] = [];
      
      // Navigate backward through all steps
      while (currentIndex !== -1) {
        visitedSteps.push(allSteps[currentIndex].id);
        currentIndex = getPreviousVisibleStepIndex(currentIndex, config);
      }
      
      // Verify AI provider was skipped (it comes after AI templates)
      expect(visitedSteps).not.toContain('ai-provider');
      
      // Verify we visited steps before AI templates
      expect(visitedSteps).toContain('ai-templates');
      expect(visitedSteps).toContain('extras');
    });

    it('should navigate backward including AI provider when templates selected', () => {
      const config = createConfig({ aiTemplates: ['chatbot', 'document-analyzer'] });
      const allSteps = getWizardSteps();
      
      // Start from last step
      let currentIndex = allSteps.length - 1;
      const visitedSteps: string[] = [];
      
      // Navigate backward through all steps
      while (currentIndex !== -1) {
        visitedSteps.push(allSteps[currentIndex].id);
        currentIndex = getPreviousVisibleStepIndex(currentIndex, config);
      }
      
      // Verify AI provider was included
      expect(visitedSteps).toContain('ai-provider');
    });
  });

  describe('Dynamic conditional changes', () => {
    it('should handle config changes that affect step visibility', () => {
      // Start with no templates
      let config = createConfig({ aiTemplates: [] });
      let visibleSteps = getVisibleSteps(config);
      
      // AI provider should not be visible
      expect(visibleSteps.find(s => s.id === 'ai-provider')).toBeUndefined();
      
      // Add a template
      config = createConfig({ aiTemplates: ['chatbot'] });
      visibleSteps = getVisibleSteps(config);
      
      // AI provider should now be visible
      expect(visibleSteps.find(s => s.id === 'ai-provider')).toBeDefined();
      
      // Remove templates
      config = createConfig({ aiTemplates: [] });
      visibleSteps = getVisibleSteps(config);
      
      // AI provider should be hidden again
      expect(visibleSteps.find(s => s.id === 'ai-provider')).toBeUndefined();
    });
  });

  describe('Step counter accuracy', () => {
    it('should have correct step counts without AI provider', () => {
      const config = createConfig({ aiTemplates: [] });
      const allSteps = getWizardSteps();
      const visibleSteps = getVisibleSteps(config);
      
      // Total steps should be one less than all steps
      expect(visibleSteps.length).toBe(allSteps.length - 1);
    });

    it('should have correct step counts with AI provider', () => {
      const config = createConfig({ aiTemplates: ['chatbot'] });
      const allSteps = getWizardSteps();
      const visibleSteps = getVisibleSteps(config);
      
      // Total steps should equal all steps
      expect(visibleSteps.length).toBe(allSteps.length);
    });
  });
});
