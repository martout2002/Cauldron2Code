/**
 * Test file for conditional step logic
 * Tests that steps with conditional functions are properly filtered
 * and navigation skips conditional steps when their condition is false
 */

import { describe, it, expect } from 'bun:test';
import { 
  getWizardSteps, 
  getVisibleSteps, 
  getNextVisibleStepIndex, 
  getPreviousVisibleStepIndex,
  getVisibleStepIndex,
  getAbsoluteStepIndex
} from './wizard-steps';
import { ScaffoldConfig } from '@/types';

describe('Conditional Step Logic', () => {
  // Helper to create a minimal config
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

  describe('getVisibleSteps', () => {
    it('should return all steps when no AI templates are selected', () => {
      const config = createConfig({ aiTemplates: [] });
      const allSteps = getWizardSteps();
      const visibleSteps = getVisibleSteps(config);
      
      // AI provider step should be filtered out
      const aiProviderStep = allSteps.find(s => s.id === 'ai-provider');
      expect(aiProviderStep).toBeDefined();
      expect(visibleSteps.find(s => s.id === 'ai-provider')).toBeUndefined();
      
      // All other steps should be visible
      expect(visibleSteps.length).toBe(allSteps.length - 1);
    });

    it('should include AI provider step when AI templates are selected', () => {
      const config = createConfig({ aiTemplates: ['chatbot'] });
      const visibleSteps = getVisibleSteps(config);
      
      // AI provider step should be included
      expect(visibleSteps.find(s => s.id === 'ai-provider')).toBeDefined();
    });

    it('should include AI provider step when multiple AI templates are selected', () => {
      const config = createConfig({ aiTemplates: ['chatbot', 'document-analyzer'] });
      const visibleSteps = getVisibleSteps(config);
      
      // AI provider step should be included
      expect(visibleSteps.find(s => s.id === 'ai-provider')).toBeDefined();
    });
  });

  describe('getNextVisibleStepIndex', () => {
    it('should skip AI provider step when no templates selected', () => {
      const config = createConfig({ aiTemplates: [] });
      const allSteps = getWizardSteps();
      
      // Find AI templates step index
      const aiTemplatesIndex = allSteps.findIndex(s => s.id === 'ai-templates');
      expect(aiTemplatesIndex).toBeGreaterThan(-1);
      
      // Next visible step should skip AI provider
      const nextIndex = getNextVisibleStepIndex(aiTemplatesIndex, config);
      
      // Should return -1 if AI templates is the last step, or the index after AI provider
      if (nextIndex !== -1) {
        const nextStep = allSteps[nextIndex];
        expect(nextStep.id).not.toBe('ai-provider');
      }
    });

    it('should include AI provider step when templates are selected', () => {
      const config = createConfig({ aiTemplates: ['chatbot'] });
      const allSteps = getWizardSteps();
      
      // Find AI templates step index
      const aiTemplatesIndex = allSteps.findIndex(s => s.id === 'ai-templates');
      
      // Next visible step should be AI provider
      const nextIndex = getNextVisibleStepIndex(aiTemplatesIndex, config);
      expect(nextIndex).toBeGreaterThan(-1);
      
      const nextStep = allSteps[nextIndex];
      expect(nextStep.id).toBe('ai-provider');
    });

    it('should return -1 when at the last visible step', () => {
      const config = createConfig({ aiTemplates: [] });
      const allSteps = getWizardSteps();
      
      // Start from the last step
      const lastIndex = allSteps.length - 1;
      const nextIndex = getNextVisibleStepIndex(lastIndex, config);
      
      expect(nextIndex).toBe(-1);
    });
  });

  describe('getPreviousVisibleStepIndex', () => {
    it('should skip AI provider step when navigating back and no templates selected', () => {
      const config = createConfig({ aiTemplates: [] });
      const allSteps = getWizardSteps();
      
      // Find AI provider step index
      const aiProviderIndex = allSteps.findIndex(s => s.id === 'ai-provider');
      
      // If there's a step after AI provider, navigate back from it
      if (aiProviderIndex < allSteps.length - 1) {
        const nextStepIndex = aiProviderIndex + 1;
        const prevIndex = getPreviousVisibleStepIndex(nextStepIndex, config);
        
        // Should skip AI provider and go to AI templates
        expect(prevIndex).toBeLessThan(aiProviderIndex);
      }
    });

    it('should include AI provider step when navigating back and templates are selected', () => {
      const config = createConfig({ aiTemplates: ['chatbot'] });
      const allSteps = getWizardSteps();
      
      // Find AI provider step index
      const aiProviderIndex = allSteps.findIndex(s => s.id === 'ai-provider');
      
      // If there's a step after AI provider, navigate back from it
      if (aiProviderIndex < allSteps.length - 1) {
        const nextStepIndex = aiProviderIndex + 1;
        const prevIndex = getPreviousVisibleStepIndex(nextStepIndex, config);
        
        // Should go to AI provider
        expect(prevIndex).toBe(aiProviderIndex);
      }
    });

    it('should return -1 when at the first step', () => {
      const config = createConfig();
      const prevIndex = getPreviousVisibleStepIndex(0, config);
      
      expect(prevIndex).toBe(-1);
    });
  });

  describe('getVisibleStepIndex', () => {
    it('should return correct visible index for AI templates step', () => {
      const config = createConfig({ aiTemplates: [] });
      const allSteps = getWizardSteps();
      
      const aiTemplatesIndex = allSteps.findIndex(s => s.id === 'ai-templates');
      const visibleIndex = getVisibleStepIndex(aiTemplatesIndex, config);
      
      expect(visibleIndex).toBeGreaterThanOrEqual(0);
    });

    it('should return -1 for AI provider step when not visible', () => {
      const config = createConfig({ aiTemplates: [] });
      const allSteps = getWizardSteps();
      
      const aiProviderIndex = allSteps.findIndex(s => s.id === 'ai-provider');
      const visibleIndex = getVisibleStepIndex(aiProviderIndex, config);
      
      expect(visibleIndex).toBe(-1);
    });

    it('should return correct visible index for AI provider step when visible', () => {
      const config = createConfig({ aiTemplates: ['chatbot'] });
      const allSteps = getWizardSteps();
      
      const aiProviderIndex = allSteps.findIndex(s => s.id === 'ai-provider');
      const visibleIndex = getVisibleStepIndex(aiProviderIndex, config);
      
      expect(visibleIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAbsoluteStepIndex', () => {
    it('should return correct absolute index from visible index', () => {
      const config = createConfig({ aiTemplates: ['chatbot'] });
      const visibleSteps = getVisibleSteps(config);
      
      // Get the visible index of AI provider
      const aiProviderVisibleIndex = visibleSteps.findIndex(s => s.id === 'ai-provider');
      
      if (aiProviderVisibleIndex >= 0) {
        const absoluteIndex = getAbsoluteStepIndex(aiProviderVisibleIndex, config);
        const allSteps = getWizardSteps();
        
        expect(allSteps[absoluteIndex].id).toBe('ai-provider');
      }
    });

    it('should return -1 for invalid visible index', () => {
      const config = createConfig();
      const absoluteIndex = getAbsoluteStepIndex(999, config);
      
      expect(absoluteIndex).toBe(-1);
    });
  });
});
