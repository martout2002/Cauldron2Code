import { describe, it, expect, beforeEach } from 'bun:test';

/**
 * Tests for AI template and provider persistence
 * 
 * Validates Requirements:
 * - 5.1: AI templates persist to localStorage immediately
 * - 5.2: AI templates restore from localStorage on page reload
 * - 5.3: AI provider persists to localStorage immediately
 * - 5.4: AI provider restores from localStorage on page reload
 */

// Mock localStorage for Node environment
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

describe('AI Template and Provider Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear module cache to force re-initialization
    delete require.cache[require.resolve('./config-store')];
  });

  describe('AI Templates Persistence (Requirements 5.1, 5.2)', () => {
    it('should persist single AI template to localStorage immediately', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Select a single AI template
      store.updateConfig({ aiTemplates: ['chatbot'] });

      // Check localStorage was updated
      const stored = localStorage.getItem('cauldron2code-config');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.config.aiTemplates).toEqual(['chatbot']);
    });

    it('should persist multiple AI templates to localStorage immediately', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Select multiple AI templates
      store.updateConfig({ 
        aiTemplates: ['chatbot', 'document-analyzer', 'semantic-search'] 
      });

      // Check localStorage was updated
      const stored = localStorage.getItem('cauldron2code-config');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.config.aiTemplates).toEqual([
        'chatbot',
        'document-analyzer',
        'semantic-search'
      ]);
    });

    it('should persist empty AI templates array to localStorage', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // First add templates
      store.updateConfig({ aiTemplates: ['chatbot'] });
      
      // Then clear them
      store.updateConfig({ aiTemplates: [] });

      // Check localStorage was updated
      const stored = localStorage.getItem('cauldron2code-config');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.config.aiTemplates).toEqual([]);
    });

    it('should restore AI templates from localStorage on page reload', () => {
      // Simulate existing state in localStorage
      const existingConfig = {
        state: {
          config: {
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
            aiTemplates: ['chatbot', 'code-assistant'],
            aiProvider: 'anthropic',
            extras: {
              docker: false,
              githubActions: false,
              redis: false,
              prettier: true,
              husky: false,
            },
          },
          _hasHydrated: false,
        },
        version: 2,
      };

      localStorage.setItem('cauldron2code-config', JSON.stringify(existingConfig));

      // Import store (simulates page reload)
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Verify templates were restored
      expect(store.config.aiTemplates).toEqual(['chatbot', 'code-assistant']);
    });

    it('should handle array serialization correctly', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Test with various array sizes
      const testCases = [
        [],
        ['chatbot'],
        ['chatbot', 'document-analyzer'],
        ['chatbot', 'document-analyzer', 'semantic-search', 'code-assistant', 'image-generator'],
      ];

      for (const templates of testCases) {
        store.updateConfig({ aiTemplates: templates });

        const stored = localStorage.getItem('cauldron2code-config');
        const parsed = JSON.parse(stored!);
        
        expect(parsed.state.config.aiTemplates).toEqual(templates);
        expect(Array.isArray(parsed.state.config.aiTemplates)).toBe(true);
      }
    });
  });

  describe('AI Provider Persistence (Requirements 5.3, 5.4)', () => {
    it('should persist AI provider to localStorage immediately', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Select AI provider
      store.updateConfig({ aiProvider: 'anthropic' });

      // Check localStorage was updated
      const stored = localStorage.getItem('cauldron2code-config');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.config.aiProvider).toBe('anthropic');
    });

    it('should persist different AI providers correctly', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      const providers = ['anthropic', 'openai', 'aws-bedrock', 'gemini'] as const;

      for (const provider of providers) {
        store.updateConfig({ aiProvider: provider });

        const stored = localStorage.getItem('cauldron2code-config');
        const parsed = JSON.parse(stored!);
        
        expect(parsed.state.config.aiProvider).toBe(provider);
      }
    });

    it('should persist undefined AI provider when cleared', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // First set a provider
      store.updateConfig({ aiProvider: 'anthropic' });
      
      // Then clear it
      store.updateConfig({ aiProvider: undefined });

      // Check localStorage was updated
      const stored = localStorage.getItem('cauldron2code-config');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.config.aiProvider).toBeUndefined();
    });

    it('should restore AI provider from localStorage on page reload', () => {
      // Simulate existing state in localStorage
      const existingConfig = {
        state: {
          config: {
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
            aiTemplates: ['chatbot'],
            aiProvider: 'openai',
            extras: {
              docker: false,
              githubActions: false,
              redis: false,
              prettier: true,
              husky: false,
            },
          },
          _hasHydrated: false,
        },
        version: 2,
      };

      localStorage.setItem('cauldron2code-config', JSON.stringify(existingConfig));

      // Import store (simulates page reload)
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Verify provider was restored
      expect(store.config.aiProvider).toBe('openai');
    });
  });

  describe('Combined AI Templates and Provider Persistence', () => {
    it('should persist both templates and provider together', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Update both at once
      store.updateConfig({ 
        aiTemplates: ['chatbot', 'document-analyzer'],
        aiProvider: 'anthropic'
      });

      // Check localStorage
      const stored = localStorage.getItem('cauldron2code-config');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.state.config.aiTemplates).toEqual(['chatbot', 'document-analyzer']);
      expect(parsed.state.config.aiProvider).toBe('anthropic');
    });

    it('should restore both templates and provider on page reload', () => {
      // Simulate existing state
      const existingConfig = {
        state: {
          config: {
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
            aiTemplates: ['semantic-search', 'code-assistant', 'image-generator'],
            aiProvider: 'gemini',
            extras: {
              docker: false,
              githubActions: false,
              redis: false,
              prettier: true,
              husky: false,
            },
          },
          _hasHydrated: false,
        },
        version: 2,
      };

      localStorage.setItem('cauldron2code-config', JSON.stringify(existingConfig));

      // Import store
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Verify both were restored
      expect(store.config.aiTemplates).toEqual(['semantic-search', 'code-assistant', 'image-generator']);
      expect(store.config.aiProvider).toBe('gemini');
    });

    it('should clear provider when templates are cleared due to framework change', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Set up initial state with Next.js, templates, and provider
      store.updateConfig({ 
        frontendFramework: 'nextjs',
        aiTemplates: ['chatbot'],
        aiProvider: 'anthropic'
      });

      // Change to incompatible framework
      store.updateConfig({ frontendFramework: 'react' });

      // Check localStorage - both should be cleared
      const stored = localStorage.getItem('cauldron2code-config');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.state.config.aiTemplates).toEqual([]);
      expect(parsed.state.config.aiProvider).toBeUndefined();
    });
  });

  describe('Edge Cases and Data Integrity', () => {
    it('should handle empty state correctly', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Default state should have empty templates and undefined provider
      expect(store.config.aiTemplates).toEqual([]);
      expect(store.config.aiProvider).toBeUndefined();
    });

    it('should handle partial config updates without affecting other fields', () => {
      const { useConfigStore } = require('./config-store');
      
      // Set initial state
      useConfigStore.getState().updateConfig({ 
        projectName: 'test-project',
        aiTemplates: ['chatbot'],
        aiProvider: 'anthropic'
      });

      // Update only templates
      useConfigStore.getState().updateConfig({ aiTemplates: ['document-analyzer'] });

      // Get fresh state and verify provider remains unchanged
      const finalState = useConfigStore.getState();
      expect(finalState.config.aiProvider).toBe('anthropic');
      expect(finalState.config.projectName).toBe('test-project');
      expect(finalState.config.aiTemplates).toEqual(['document-analyzer']);
    });

    it('should maintain data integrity across multiple updates', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Perform multiple updates
      store.updateConfig({ aiTemplates: ['chatbot'] });
      store.updateConfig({ aiProvider: 'anthropic' });
      store.updateConfig({ aiTemplates: ['chatbot', 'document-analyzer'] });
      store.updateConfig({ aiProvider: 'openai' });

      // Final state should be correct
      const stored = localStorage.getItem('cauldron2code-config');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.state.config.aiTemplates).toEqual(['chatbot', 'document-analyzer']);
      expect(parsed.state.config.aiProvider).toBe('openai');
    });

    it('should handle rapid successive updates', () => {
      const { useConfigStore } = require('./config-store');
      const store = useConfigStore.getState();

      // Rapid updates
      for (let i = 0; i < 10; i++) {
        store.updateConfig({ aiTemplates: [`template-${i}`] });
      }

      // Last update should win
      const stored = localStorage.getItem('cauldron2code-config');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.state.config.aiTemplates).toEqual(['template-9']);
    });
  });
});
