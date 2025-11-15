import { create } from 'zustand';
import { ScaffoldConfig } from '@/types';

interface ConfigState {
  config: ScaffoldConfig;
  updateConfig: (updates: Partial<ScaffoldConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: ScaffoldConfig = {
  projectName: '',
  description: '',
  framework: 'next',
  nextjsRouter: 'app',
  auth: 'none',
  database: 'none',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['vercel'],
  aiTemplate: 'none',
  extras: {
    docker: false,
    githubActions: false,
    redis: false,
    prettier: true,
    husky: false,
  },
};

export const useConfigStore = create<ConfigState>((set) => ({
  config: defaultConfig,
  updateConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),
  resetConfig: () => set({ config: defaultConfig }),
}));
