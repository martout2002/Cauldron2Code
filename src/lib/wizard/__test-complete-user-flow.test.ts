/**
 * Integration test for complete AI template user flow
 * Task 12: Test complete user flow
 * 
 * This test validates the entire user journey through the wizard with AI template selection:
 * - Navigating through wizard with AI template selection
 * - Selecting multiple AI templates
 * - Provider step appears after template selection
 * - Skipping AI templates (provider step should not appear)
 * - Framework compatibility (templates disabled for non-Next.js)
 * - Persistence across page reloads
 * 
 * Requirements: All (1.1-5.4)
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { 
  getWizardSteps, 
  getVisibleSteps, 
  getNextVisibleStepIndex, 
  getPreviousVisibleStepIndex
} from '@/lib/wizard/wizard-steps';
import { validateStep } from '@/lib/wizard/wizard-validation';
import { isAITemplateCompatible } from '@/lib/wizard/compatibility-rules';
import { ScaffoldConfig } from '@/types';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock as any;

describe('Complete AI Template User Flow Integration', () => {
  const createConfig = (overrides: Partial<ScaffoldConfig> = {}): ScaffoldConfig => ({
    projectName: 'test-project',
    description: 'Test description',
    frontendFramework: 'nextjs',
    backendFramework: 'nextjs-api',
    buildTool: 'auto',
    projectStructure: 'nextjs-only',
    nextjsRouter: 'app',
    auth: 'none',
    database: 'none',
    api: 'rest-fetch',
    styling: 'tailwind',
    shadcn: true,
    colorScheme: 'purple',
    deployment: ['vercel'],
    aiTemplates: [],
    aiProvider: undefined,
    extras: {
      docker: false,
      githubActions: false,
      redis: false,
      prettier: true,
      husky: false,
    },
    ...overrides,
  });

  beforeEach(() => {
    localStorage.clear();
    delete require.cache[require.resolve('@/lib/store/config-store')];
  });

  describe('Flow 1: Complete wizard with AI template selection', () => {
    it('should navigate through entire wizard selecting AI templates and provider', () => {
      const allSteps = getWizardSteps();
      let config = createConfig();
      
      // Step 1: Project Name
      let currentIndex = 0;
      expect(allSteps[currentIndex].id).toBe('project-name');
      config = { ...config, projectName: 'my-ai-app' };
      expect(validateStep(currentIndex, config).isValid).toBe(true);
      
      // Step 2: Description
      currentIndex = getNextVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('description');
      config = { ...config, description: 'An AI-powered application' };
      expect(validateStep(currentIndex, config).isValid).toBe(true);
      
      // Step 3: Frontend Framework (Next.js)
      currentIndex = getNextVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('frontend');
      config = { ...config, frontendFramework: 'nextjs' };
      expect(validateStep(currentIndex, config).isValid).toBe(true);
      
      // Step 4: Backend Framework
      currentIndex = getNextVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('backend');
      config = { ...config, backendFramework: 'nextjs-api' };
      expect(validateStep(currentIndex, config).isValid).toBe(true);
      
      // Step 5: Database
      currentIndex = getNextVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('database');
      config = { ...config, database: 'prisma-postgres' };
      expect(validateStep(currentIndex, config).isValid).toBe(true);
      
      // Step 6: Auth
      currentIndex = getNextVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('auth');
      config = { ...config, auth: 'nextauth' };
      expect(validateStep(currentIndex, config).isValid).toBe(true);
      
      // Step 7: Styling
      currentIndex = getNextVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('styling');
      config = { ...config, styling: 'tailwind' };
      expect(validateStep(currentIndex, config).isValid).toBe(true);
      
      // Step 8: Extras
      currentIndex = getNextVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('extras');
      config = { ...config, extras: { ...config.extras, docker: true } };
      expect(validateStep(currentIndex, config).isValid).toBe(true);
      
      // Step 9: AI Templates - Select multiple templates
      currentIndex = getNextVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('ai-templates');
      config = { ...config, aiTemplates: ['chatbot', 'document-analyzer'] };
      expect(validateStep(currentIndex, config).isValid).toBe(true);
      
      // Step 10: AI Provider - Should appear because templates were selected
      currentIndex = getNextVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('ai-provider');
      
      // Validation should fail without provider
      expect(validateStep(currentIndex, config).isValid).toBe(false);
      
      // Select provider
      config = { ...config, aiProvider: 'anthropic' };
      expect(validateStep(currentIndex, config).isValid).toBe(true);
      
      // Should be at the end
      const nextIndex = getNextVisibleStepIndex(currentIndex, config);
      expect(nextIndex).toBe(-1);
    });
  });

  describe('Flow 2: Selecting multiple AI templates', () => {
    it('should allow selection of multiple AI templates', () => {
      const config = createConfig({
        aiTemplates: ['chatbot', 'document-analyzer', 'semantic-search']
      });
      
      const allSteps = getWizardSteps();
      const aiTemplatesStep = allSteps.find(s => s.id === 'ai-templates');
      
      expect(aiTemplatesStep).toBeDefined();
      expect(aiTemplatesStep?.multiSelect).toBe(true);
      expect(config.aiTemplates).toHaveLength(3);
      expect(config.aiTemplates).toContain('chatbot');
      expect(config.aiTemplates).toContain('document-analyzer');
      expect(config.aiTemplates).toContain('semantic-search');
    });

    it('should validate all selected templates are valid options', () => {
      const allSteps = getWizardSteps();
      const aiTemplatesStep = allSteps.find(s => s.id === 'ai-templates');
      const validOptions = aiTemplatesStep?.options?.map(o => o.value) || [];
      
      const config = createConfig({
        aiTemplates: ['chatbot', 'code-assistant', 'image-generator']
      });
      
      // All selected templates should be valid options
      config.aiTemplates.forEach(template => {
        expect(validOptions).toContain(template);
      });
    });
  });

  describe('Flow 3: Provider step appears after template selection', () => {
    it('should show AI provider step when templates are selected', () => {
      const config = createConfig({
        aiTemplates: ['chatbot']
      });
      
      const visibleSteps = getVisibleSteps(config);
      const hasProviderStep = visibleSteps.some(s => s.id === 'ai-provider');
      
      expect(hasProviderStep).toBe(true);
    });

    it('should show AI provider step after AI templates step', () => {
      const config = createConfig({
        aiTemplates: ['chatbot', 'document-analyzer']
      });
      
      const allSteps = getWizardSteps();
      const aiTemplatesIndex = allSteps.findIndex(s => s.id === 'ai-templates');
      
      // Navigate to next step after AI templates
      const nextIndex = getNextVisibleStepIndex(aiTemplatesIndex, config);
      expect(allSteps[nextIndex].id).toBe('ai-provider');
    });

    it('should require provider selection when templates are selected', () => {
      const allSteps = getWizardSteps();
      const aiProviderIndex = allSteps.findIndex(s => s.id === 'ai-provider');
      
      const configWithoutProvider = createConfig({
        aiTemplates: ['chatbot'],
        aiProvider: undefined
      });
      
      const result = validateStep(aiProviderIndex, configWithoutProvider);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should pass validation when provider is selected', () => {
      const allSteps = getWizardSteps();
      const aiProviderIndex = allSteps.findIndex(s => s.id === 'ai-provider');
      
      const configWithProvider = createConfig({
        aiTemplates: ['chatbot'],
        aiProvider: 'anthropic'
      });
      
      const result = validateStep(aiProviderIndex, configWithProvider);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Flow 4: Skipping AI templates (provider step should not appear)', () => {
    it('should not show AI provider step when no templates are selected', () => {
      const config = createConfig({
        aiTemplates: []
      });
      
      const visibleSteps = getVisibleSteps(config);
      const hasProviderStep = visibleSteps.some(s => s.id === 'ai-provider');
      
      expect(hasProviderStep).toBe(false);
    });

    it('should skip AI provider step during navigation when no templates', () => {
      const config = createConfig({
        aiTemplates: []
      });
      
      const allSteps = getWizardSteps();
      const aiTemplatesIndex = allSteps.findIndex(s => s.id === 'ai-templates');
      
      // Navigate to next step after AI templates
      const nextIndex = getNextVisibleStepIndex(aiTemplatesIndex, config);
      
      // Should skip AI provider and go to end
      expect(nextIndex).toBe(-1);
    });

    it('should complete wizard without provider when no templates selected', () => {
      const config = createConfig({
        projectName: 'test-app',
        description: 'Test',
        aiTemplates: [],
        aiProvider: undefined
      });
      
      const allSteps = getWizardSteps();
      let currentIndex = 0;
      const visitedSteps: string[] = [];
      
      // Navigate through all steps
      while (currentIndex !== -1) {
        visitedSteps.push(allSteps[currentIndex].id);
        currentIndex = getNextVisibleStepIndex(currentIndex, config);
      }
      
      // Should not visit AI provider
      expect(visitedSteps).not.toContain('ai-provider');
      expect(visitedSteps).toContain('ai-templates');
    });
  });

  describe('Flow 5: Framework compatibility (templates disabled for non-Next.js)', () => {
    it('should mark AI templates as incompatible for React SPA', () => {
      const config = createConfig({
        frontendFramework: 'react',
        projectStructure: 'react-spa'
      });
      
      const isCompatible = isAITemplateCompatible(config);
      expect(isCompatible).toBe(false);
    });

    it('should mark AI templates as incompatible for Vue', () => {
      const config = createConfig({
        frontendFramework: 'vue',
        projectStructure: 'react-spa'
      });
      
      const isCompatible = isAITemplateCompatible(config);
      expect(isCompatible).toBe(false);
    });

    it('should mark AI templates as incompatible for Angular', () => {
      const config = createConfig({
        frontendFramework: 'angular',
        projectStructure: 'react-spa'
      });
      
      const isCompatible = isAITemplateCompatible(config);
      expect(isCompatible).toBe(false);
    });

    it('should mark AI templates as incompatible for Svelte', () => {
      const config = createConfig({
        frontendFramework: 'svelte',
        projectStructure: 'react-spa'
      });
      
      const isCompatible = isAITemplateCompatible(config);
      expect(isCompatible).toBe(false);
    });

    it('should mark AI templates as compatible for Next.js', () => {
      const config = createConfig({
        frontendFramework: 'nextjs',
        projectStructure: 'nextjs-only'
      });
      
      const isCompatible = isAITemplateCompatible(config);
      expect(isCompatible).toBe(true);
    });

    it('should mark AI templates as compatible for fullstack monorepo', () => {
      const config = createConfig({
        frontendFramework: 'react',
        projectStructure: 'fullstack-monorepo'
      });
      
      const isCompatible = isAITemplateCompatible(config);
      expect(isCompatible).toBe(true);
    });

    it('should clear AI templates when framework changes to incompatible', () => {
      const { useConfigStore } = require('@/lib/store/config-store');
      
      // First, set up Next.js framework (compatible)
      useConfigStore.getState().updateConfig({
        frontendFramework: 'nextjs',
        projectStructure: 'nextjs-only',
      });
      
      // Then add templates and provider
      useConfigStore.getState().updateConfig({
        aiTemplates: ['chatbot', 'document-analyzer'],
        aiProvider: 'anthropic'
      });
      
      const store = useConfigStore.getState();
      expect(store.config.aiTemplates).toHaveLength(2);
      expect(store.config.aiProvider).toBe('anthropic');
      
      // Change to React (incompatible)
      useConfigStore.getState().updateConfig({
        frontendFramework: 'react',
        projectStructure: 'react-spa'
      });
      
      // Get fresh state after update
      const updatedStore = useConfigStore.getState();
      
      // Templates and provider should be cleared
      expect(updatedStore.config.aiTemplates).toEqual([]);
      expect(updatedStore.config.aiProvider).toBeUndefined();
    });
  });

  describe('Flow 6: Persistence across page reloads', () => {
    it('should persist AI templates to localStorage', () => {
      const { useConfigStore } = require('@/lib/store/config-store');
      const store = useConfigStore.getState();
      
      store.updateConfig({
        aiTemplates: ['chatbot', 'semantic-search']
      });
      
      const stored = localStorage.getItem('cauldron2code-config');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.state.config.aiTemplates).toEqual(['chatbot', 'semantic-search']);
    });

    it('should persist AI provider to localStorage', () => {
      const { useConfigStore } = require('@/lib/store/config-store');
      const store = useConfigStore.getState();
      
      store.updateConfig({
        aiProvider: 'openai'
      });
      
      const stored = localStorage.getItem('cauldron2code-config');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.state.config.aiProvider).toBe('openai');
    });

    it('should restore AI templates after page reload', () => {
      // Set up initial state
      const existingConfig = {
        state: {
          config: createConfig({
            aiTemplates: ['code-assistant', 'image-generator'],
            aiProvider: 'gemini'
          }),
          _hasHydrated: false,
        },
        version: 2,
      };
      
      localStorage.setItem('cauldron2code-config', JSON.stringify(existingConfig));
      
      // Simulate page reload
      delete require.cache[require.resolve('@/lib/store/config-store')];
      const { useConfigStore } = require('@/lib/store/config-store');
      const store = useConfigStore.getState();
      
      // Verify restoration
      expect(store.config.aiTemplates).toEqual(['code-assistant', 'image-generator']);
      expect(store.config.aiProvider).toBe('gemini');
    });

    it('should maintain complete wizard state across reload', () => {
      // Complete a full wizard flow
      const { useConfigStore } = require('@/lib/store/config-store');
      const store = useConfigStore.getState();
      
      store.updateConfig({
        projectName: 'my-ai-project',
        description: 'AI-powered app',
        frontendFramework: 'nextjs',
        backendFramework: 'nextjs-api',
        database: 'supabase',
        auth: 'nextauth',
        styling: 'tailwind',
        aiTemplates: ['chatbot', 'document-analyzer', 'semantic-search'],
        aiProvider: 'anthropic',
        extras: {
          docker: true,
          githubActions: true,
          redis: false,
          prettier: true,
          husky: true,
        }
      });
      
      // Simulate page reload
      delete require.cache[require.resolve('@/lib/store/config-store')];
      const { useConfigStore: useConfigStore2 } = require('@/lib/store/config-store');
      const reloadedStore = useConfigStore2.getState();
      
      // Verify all state is restored
      expect(reloadedStore.config.projectName).toBe('my-ai-project');
      expect(reloadedStore.config.aiTemplates).toEqual(['chatbot', 'document-analyzer', 'semantic-search']);
      expect(reloadedStore.config.aiProvider).toBe('anthropic');
      expect(reloadedStore.config.extras.docker).toBe(true);
    });
  });

  describe('Flow 7: Complete user journey scenarios', () => {
    it('should handle user changing mind about AI templates', () => {
      const { useConfigStore } = require('@/lib/store/config-store');
      
      // Ensure we start with a compatible framework
      useConfigStore.getState().updateConfig({
        frontendFramework: 'nextjs',
        projectStructure: 'nextjs-only',
      });
      
      // User selects templates
      useConfigStore.getState().updateConfig({ aiTemplates: ['chatbot'] });
      let store = useConfigStore.getState();
      expect(store.config.aiTemplates).toEqual(['chatbot']);
      
      // User changes selection
      useConfigStore.getState().updateConfig({ aiTemplates: ['document-analyzer', 'semantic-search'] });
      store = useConfigStore.getState();
      expect(store.config.aiTemplates).toEqual(['document-analyzer', 'semantic-search']);
      
      // User removes all templates
      useConfigStore.getState().updateConfig({ aiTemplates: [] });
      store = useConfigStore.getState();
      expect(store.config.aiTemplates).toEqual([]);
    });

    it('should handle user changing AI provider', () => {
      const { useConfigStore } = require('@/lib/store/config-store');
      
      // Ensure we start with a compatible framework
      useConfigStore.getState().updateConfig({
        frontendFramework: 'nextjs',
        projectStructure: 'nextjs-only',
      });
      
      useConfigStore.getState().updateConfig({
        aiTemplates: ['chatbot'],
        aiProvider: 'anthropic'
      });
      let store = useConfigStore.getState();
      expect(store.config.aiProvider).toBe('anthropic');
      
      // User changes provider
      useConfigStore.getState().updateConfig({ aiProvider: 'openai' });
      store = useConfigStore.getState();
      expect(store.config.aiProvider).toBe('openai');
      
      // User changes again
      useConfigStore.getState().updateConfig({ aiProvider: 'gemini' });
      store = useConfigStore.getState();
      expect(store.config.aiProvider).toBe('gemini');
    });

    it('should handle backward navigation through wizard', () => {
      const config = createConfig({
        aiTemplates: ['chatbot'],
        aiProvider: 'anthropic'
      });
      
      const allSteps = getWizardSteps();
      
      // Start from AI provider step
      let currentIndex = allSteps.findIndex(s => s.id === 'ai-provider');
      expect(currentIndex).toBeGreaterThan(-1);
      
      // Go back to AI templates
      currentIndex = getPreviousVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('ai-templates');
      
      // Go back to extras
      currentIndex = getPreviousVisibleStepIndex(currentIndex, config);
      expect(allSteps[currentIndex].id).toBe('extras');
    });

    it('should handle step counter correctly with AI provider visible', () => {
      const config = createConfig({
        aiTemplates: ['chatbot']
      });
      
      const visibleSteps = getVisibleSteps(config);
      const allSteps = getWizardSteps();
      
      // All 10 steps should be visible
      expect(visibleSteps.length).toBe(10);
      expect(allSteps.length).toBe(10);
      
      // Verify AI provider is included
      expect(visibleSteps.some(s => s.id === 'ai-provider')).toBe(true);
    });

    it('should handle step counter correctly with AI provider hidden', () => {
      const config = createConfig({
        aiTemplates: []
      });
      
      const visibleSteps = getVisibleSteps(config);
      const allSteps = getWizardSteps();
      
      // 9 steps should be visible (AI provider hidden)
      expect(visibleSteps.length).toBe(9);
      expect(allSteps.length).toBe(10);
      
      // Verify AI provider is not included
      expect(visibleSteps.some(s => s.id === 'ai-provider')).toBe(false);
    });
  });

  describe('Flow 8: Edge cases and error handling', () => {
    it('should handle empty template array correctly', () => {
      const config = createConfig({
        aiTemplates: []
      });
      
      const allSteps = getWizardSteps();
      const aiTemplatesIndex = allSteps.findIndex(s => s.id === 'ai-templates');
      
      // Should be valid to have no templates
      const result = validateStep(aiTemplatesIndex, config);
      expect(result.isValid).toBe(true);
    });

    it('should handle all templates selected', () => {
      const allSteps = getWizardSteps();
      const aiTemplatesStep = allSteps.find(s => s.id === 'ai-templates');
      const allTemplateOptions = aiTemplatesStep?.options?.map(o => o.value) || [];
      
      const config = createConfig({
        aiTemplates: allTemplateOptions
      });
      
      expect(config.aiTemplates.length).toBe(5);
      expect(config.aiTemplates).toContain('chatbot');
      expect(config.aiTemplates).toContain('document-analyzer');
      expect(config.aiTemplates).toContain('semantic-search');
      expect(config.aiTemplates).toContain('code-assistant');
      expect(config.aiTemplates).toContain('image-generator');
    });

    it('should handle provider selection without templates (edge case)', () => {
      const allSteps = getWizardSteps();
      const _aiProviderIndex = allSteps.findIndex(s => s.id === 'ai-provider');
      
      // This shouldn't happen in normal flow, but test it anyway
      const config = createConfig({
        aiTemplates: [],
        aiProvider: 'anthropic'
      });
      
      // Validation should pass (provider step shouldn't even be visible)
      const visibleSteps = getVisibleSteps(config);
      expect(visibleSteps.some(s => s.id === 'ai-provider')).toBe(false);
    });

    it('should handle rapid template selection changes', () => {
      const { useConfigStore } = require('@/lib/store/config-store');
      
      // Ensure we start with a compatible framework
      useConfigStore.getState().updateConfig({
        frontendFramework: 'nextjs',
        projectStructure: 'nextjs-only',
      });
      
      // Rapid changes
      useConfigStore.getState().updateConfig({ aiTemplates: ['chatbot'] });
      useConfigStore.getState().updateConfig({ aiTemplates: ['chatbot', 'document-analyzer'] });
      useConfigStore.getState().updateConfig({ aiTemplates: ['semantic-search'] });
      useConfigStore.getState().updateConfig({ aiTemplates: [] });
      useConfigStore.getState().updateConfig({ aiTemplates: ['code-assistant', 'image-generator'] });
      
      // Final state should be correct
      const store = useConfigStore.getState();
      expect(store.config.aiTemplates).toEqual(['code-assistant', 'image-generator']);
    });
  });
});
