import { describe, it, expect, beforeEach } from 'bun:test';

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

describe('Config Store Migration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear module cache to force re-initialization
    delete require.cache[require.resolve('./config-store')];
  });

  it('should migrate old aiTemplate to aiTemplates array', () => {
    // Simulate old config in localStorage
    const oldConfig = {
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
          aiTemplate: 'chatbot', // Old singular field
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
      version: 1,
    };

    localStorage.setItem('cauldron2code-config', JSON.stringify(oldConfig));

    // Import the store to trigger migration
    const { useConfigStore } = require('./config-store');
    const store = useConfigStore.getState();

    // Check that aiTemplate was migrated to aiTemplates
    expect(store.config.aiTemplates).toEqual(['chatbot']);
    expect((store.config as any).aiTemplate).toBeUndefined();
  });

  it('should migrate aiTemplate "none" to empty array', () => {
    const oldConfig = {
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
          aiTemplate: 'none', // Old "none" value
          aiProvider: undefined,
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
      version: 1,
    };

    localStorage.setItem('cauldron2code-config', JSON.stringify(oldConfig));

    const { useConfigStore } = require('./config-store');
    const store = useConfigStore.getState();

    expect(store.config.aiTemplates).toEqual([]);
    expect((store.config as any).aiTemplate).toBeUndefined();
  });

  it('should handle missing aiTemplate field', () => {
    const oldConfig = {
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
          // No aiTemplate field
          aiProvider: undefined,
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
      version: 1,
    };

    localStorage.setItem('cauldron2code-config', JSON.stringify(oldConfig));

    const { useConfigStore } = require('./config-store');
    const store = useConfigStore.getState();

    expect(store.config.aiTemplates).toEqual([]);
  });
});
