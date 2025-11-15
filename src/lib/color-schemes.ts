import { ColorSchemeConfig } from '@/types';

export const COLOR_SCHEMES: Record<string, ColorSchemeConfig> = {
  purple: {
    name: 'purple',
    displayName: 'Purple',
    description: 'Modern and professional with purple accents',
    preview: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#C4B5FD',
      background: '#FAFAFA',
      text: '#1F2937',
    },
    cssVariables: {
      '--color-primary': '139 92 246',
      '--color-secondary': '167 139 250',
      '--color-accent': '196 181 253',
      '--color-background': '250 250 250',
      '--color-foreground': '31 41 55',
    },
    tailwindExtend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
      },
    },
  },
  gold: {
    name: 'gold',
    displayName: 'Gold',
    description: 'Elegant and luxurious with gold tones',
    preview: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      accent: '#FCD34D',
      background: '#FFFBEB',
      text: '#78350F',
    },
    cssVariables: {
      '--color-primary': '245 158 11',
      '--color-secondary': '251 191 36',
      '--color-accent': '252 211 77',
      '--color-background': '255 251 235',
      '--color-foreground': '120 53 15',
    },
  },
  white: {
    name: 'white',
    displayName: 'White',
    description: 'Clean and minimal with neutral tones',
    preview: {
      primary: '#000000',
      secondary: '#404040',
      accent: '#737373',
      background: '#FFFFFF',
      text: '#171717',
    },
    cssVariables: {
      '--color-primary': '0 0 0',
      '--color-secondary': '64 64 64',
      '--color-accent': '115 115 115',
      '--color-background': '255 255 255',
      '--color-foreground': '23 23 23',
    },
  },
  futuristic: {
    name: 'futuristic',
    displayName: 'Futuristic',
    description: 'Cyberpunk-inspired with neon accents',
    preview: {
      primary: '#06B6D4',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      background: '#0F172A',
      text: '#F1F5F9',
    },
    cssVariables: {
      '--color-primary': '6 182 212',
      '--color-secondary': '139 92 246',
      '--color-accent': '236 72 153',
      '--color-background': '15 23 42',
      '--color-foreground': '241 245 249',
    },
  },
};
