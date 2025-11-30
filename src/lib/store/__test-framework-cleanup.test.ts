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

describe('Framework Change Cleanup Logic', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear module cache to force re-initialization
    delete require.cache[require.resolve('./config-store')];
  });

  it('should clear aiTemplates when changing from Next.js to React', () => {
    const { useConfigStore } = require('./config-store');

    // Set up initial state with Next.js and AI templates
    useConfigStore.getState().updateConfig({
      frontendFramework: 'nextjs',
      aiTemplates: ['chatbot', 'document-analyzer'],
      aiProvider: 'anthropic',
    });

    // Verify initial state
    let currentState = useConfigStore.getState();
    expect(currentState.config.aiTemplates).toEqual(['chatbot', 'document-analyzer']);
    expect(currentState.config.aiProvider).toBe('anthropic');

    // Change to React (incompatible with AI templates)
    useConfigStore.getState().updateConfig({
      frontendFramework: 'react',
    });

    // Verify AI templates and provider are cleared
    currentState = useConfigStore.getState();
    expect(currentState.config.aiTemplates).toEqual([]);
    expect(currentState.config.aiProvider).toBeUndefined();
  });

  it('should clear aiTemplates when changing project structure from monorepo to react-spa', () => {
    const { useConfigStore } = require('./config-store');

    // Set up initial state with monorepo and AI templates
    // Need to set backend to prevent auto-adjust from changing structure
    useConfigStore.getState().updateConfig({
      frontendFramework: 'react',
      backendFramework: 'express',
      projectStructure: 'fullstack-monorepo',
      aiTemplates: ['semantic-search', 'code-assistant'],
      aiProvider: 'openai',
    });

    // Verify initial state
    let currentState = useConfigStore.getState();
    expect(currentState.config.aiTemplates).toEqual(['semantic-search', 'code-assistant']);
    expect(currentState.config.aiProvider).toBe('openai');

    // Change to react-spa (incompatible with AI templates when not Next.js)
    useConfigStore.getState().updateConfig({
      projectStructure: 'react-spa',
    });

    // Verify AI templates and provider are cleared
    currentState = useConfigStore.getState();
    expect(currentState.config.aiTemplates).toEqual([]);
    expect(currentState.config.aiProvider).toBeUndefined();
  });

  it('should NOT clear aiTemplates when staying with Next.js', () => {
    const { useConfigStore } = require('./config-store');

    // Set up initial state with Next.js and AI templates
    useConfigStore.getState().updateConfig({
      frontendFramework: 'nextjs',
      aiTemplates: ['chatbot'],
      aiProvider: 'anthropic',
    });

    // Change backend but keep Next.js frontend
    useConfigStore.getState().updateConfig({
      backendFramework: 'express',
    });

    // Verify AI templates are NOT cleared
    const currentState = useConfigStore.getState();
    expect(currentState.config.aiTemplates).toEqual(['chatbot']);
    expect(currentState.config.aiProvider).toBe('anthropic');
  });

  it('should NOT clear aiTemplates when staying with fullstack-monorepo', () => {
    const { useConfigStore } = require('./config-store');

    // Set up initial state with monorepo and AI templates
    // Need to set backend to prevent auto-adjust from changing structure
    useConfigStore.getState().updateConfig({
      frontendFramework: 'react',
      backendFramework: 'express',
      projectStructure: 'fullstack-monorepo',
      aiTemplates: ['image-generator'],
      aiProvider: 'gemini',
    });

    // Change something else but keep monorepo structure
    useConfigStore.getState().updateConfig({
      styling: 'css-modules',
    });

    // Verify AI templates are NOT cleared
    const currentState = useConfigStore.getState();
    expect(currentState.config.aiTemplates).toEqual(['image-generator']);
    expect(currentState.config.aiProvider).toBe('gemini');
  });

  it('should handle empty aiTemplates array gracefully', () => {
    const { useConfigStore } = require('./config-store');

    // Set up initial state with no AI templates
    useConfigStore.getState().updateConfig({
      frontendFramework: 'nextjs',
      aiTemplates: [],
      aiProvider: undefined,
    });

    // Change to React
    useConfigStore.getState().updateConfig({
      frontendFramework: 'react',
    });

    // Verify no errors and state remains empty
    const currentState = useConfigStore.getState();
    expect(currentState.config.aiTemplates).toEqual([]);
    expect(currentState.config.aiProvider).toBeUndefined();
  });

  it('should clear aiProvider even if aiTemplates is already empty', () => {
    const { useConfigStore } = require('./config-store');

    // Set up initial state with Next.js, empty templates, but provider set
    useConfigStore.getState().updateConfig({
      frontendFramework: 'nextjs',
      aiTemplates: [],
      aiProvider: 'anthropic',
    });

    // Change to React (incompatible)
    useConfigStore.getState().updateConfig({
      frontendFramework: 'react',
    });

    // Verify provider is cleared
    const currentState = useConfigStore.getState();
    expect(currentState.config.aiTemplates).toEqual([]);
    expect(currentState.config.aiProvider).toBeUndefined();
  });
});
