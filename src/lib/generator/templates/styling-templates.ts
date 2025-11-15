import { ScaffoldConfig } from '@/types';
import { COLOR_SCHEMES } from '@/lib/color-schemes';

/**
 * Generate globals.css with color scheme variables
 */
export function generateGlobalsCss(config: ScaffoldConfig): string {
  const scheme = COLOR_SCHEMES[config.colorScheme];
  if (!scheme) {
    throw new Error(`Color scheme '${config.colorScheme}' not found`);
  }

  if (config.styling === 'tailwind') {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
${Object.entries(scheme.cssVariables)
  .map(([key, value]) => `    ${key}: ${value};`)
  .join('\n')}
    --radius: 0.5rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }

  h1 {
    @apply text-4xl;
  }

  h2 {
    @apply text-3xl;
  }

  h3 {
    @apply text-2xl;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
`;
  } else if (config.styling === 'css-modules') {
    return `:root {
${Object.entries(scheme.cssVariables)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n')}
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  background: rgb(var(--color-background));
  color: rgb(var(--color-foreground));
}

a {
  color: inherit;
  text-decoration: none;
}
`;
  } else {
    // styled-components
    return `:root {
${Object.entries(scheme.cssVariables)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n')}
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}
`;
  }
}

/**
 * Generate Tailwind config with theme colors
 */
export function generateTailwindConfig(config: ScaffoldConfig): string {
  const scheme = COLOR_SCHEMES[config.colorScheme];
  if (!scheme) {
    throw new Error(`Color scheme '${config.colorScheme}' not found`);
  }

  // Add tailwindcss-animate plugin if shadcn is enabled
  const plugins = config.shadcn 
    ? `  plugins: [require('tailwindcss-animate')],` 
    : `  plugins: [],`;

  return `import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          foreground: 'rgb(var(--color-background) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-foreground) / 0.1)',
          foreground: 'rgb(var(--color-foreground) / 0.6)',
        },
        border: 'rgb(var(--color-foreground) / 0.1)',
        input: 'rgb(var(--color-foreground) / 0.2)',
        ring: 'rgb(var(--color-primary) / <alpha-value>)',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
${plugins}
};

export default config;
`;
}

/**
 * Generate PostCSS config for Tailwind
 */
export function generatePostCssConfig(): string {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

/**
 * Generate shadcn/ui components.json config
 */
export function generateComponentsJson(config: ScaffoldConfig): string {
  const isMonorepo = config.framework === 'monorepo';
  const basePath = isMonorepo ? 'apps/web' : '.';

  const componentsConfig = {
    $schema: 'https://ui.shadcn.com/schema.json',
    style: 'default',
    rsc: true,
    tsx: true,
    tailwind: {
      config: `${basePath}/tailwind.config.ts`,
      css: `${basePath}/src/app/globals.css`,
      baseColor: config.colorScheme === 'purple' ? 'violet' : 
                 config.colorScheme === 'gold' ? 'amber' :
                 config.colorScheme === 'white' ? 'neutral' : 'cyan',
      cssVariables: true,
    },
    aliases: {
      components: `${basePath}/src/components`,
      utils: `${basePath}/src/lib/utils`,
    },
  };

  return JSON.stringify(componentsConfig, null, 2);
}

/**
 * Generate styled-components theme
 */
export function generateStyledComponentsTheme(config: ScaffoldConfig): string {
  const scheme = COLOR_SCHEMES[config.colorScheme];
  if (!scheme) {
    throw new Error(`Color scheme '${config.colorScheme}' not found`);
  }

  return `export const theme = {
  colors: {
    primary: '${scheme.preview.primary}',
    secondary: '${scheme.preview.secondary}',
    accent: '${scheme.preview.accent}',
    background: '${scheme.preview.background}',
    text: '${scheme.preview.text}',
  },
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: 'inherit',
  },
  fontSizes: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xlarge: '2rem',
  },
};

export type Theme = typeof theme;
`;
}

/**
 * Generate styled-components global styles
 */
export function generateStyledComponentsGlobalStyles(config: ScaffoldConfig): string {
  const scheme = COLOR_SCHEMES[config.colorScheme];
  if (!scheme) {
    throw new Error(`Color scheme '${config.colorScheme}' not found`);
  }

  return `import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>\`
  :root {
${Object.entries(scheme.cssVariables)
  .map(([key, value]) => `    ${key}: ${value};`)
  .join('\n')}
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: \${(props) => props.theme.fonts.body};
    background-color: \${(props) => props.theme.colors.background};
    color: \${(props) => props.theme.colors.text};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
  }

  h1 {
    font-size: 2.25rem;
  }

  h2 {
    font-size: 1.875rem;
  }

  h3 {
    font-size: 1.5rem;
  }
\`;
`;
}

/**
 * Generate styled-components theme provider
 */
export function generateStyledComponentsProvider(): string {
  return `'use client';

import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyles } from './global-styles';

export function StyledComponentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}
`;
}

/**
 * Generate styled-components Button component
 */
export function generateStyledComponentsButton(): string {
  return `import styled, { css } from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'default' | 'large';
}

const buttonVariants = {
  primary: css\`
    background-color: \${(props) => props.theme.colors.primary};
    color: \${(props) => props.theme.colors.background};

    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  \`,
  secondary: css\`
    background-color: \${(props) => props.theme.colors.secondary};
    color: \${(props) => props.theme.colors.text};

    &:hover:not(:disabled) {
      opacity: 0.8;
    }
  \`,
  outline: css\`
    background-color: transparent;
    border: 1px solid \${(props) => props.theme.colors.text}33;
    color: \${(props) => props.theme.colors.text};

    &:hover:not(:disabled) {
      background-color: \${(props) => props.theme.colors.text}0d;
    }
  \`,
};

const buttonSizes = {
  small: css\`
    padding: \${(props) => props.theme.spacing.small} \${(props) => props.theme.spacing.medium};
    font-size: \${(props) => props.theme.fontSizes.small};
  \`,
  default: css\`
    padding: \${(props) => props.theme.spacing.small} \${(props) => props.theme.spacing.large};
    font-size: \${(props) => props.theme.fontSizes.medium};
  \`,
  large: css\`
    padding: \${(props) => props.theme.spacing.medium} \${(props) => props.theme.spacing.xlarge};
    font-size: \${(props) => props.theme.fontSizes.medium};
  \`,
};

export const Button = styled.button<ButtonProps>\`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  \${(props) => buttonVariants[props.variant || 'primary']}
  \${(props) => buttonSizes[props.size || 'default']}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
\`;
`;
}

/**
 * Generate styled-components Card component
 */
export function generateStyledComponentsCard(): string {
  return `import styled from 'styled-components';

export const Card = styled.div\`
  border-radius: 0.5rem;
  border: 1px solid \${(props) => props.theme.colors.text}1a;
  background-color: \${(props) => props.theme.colors.background};
  box-shadow: 0 1px 3px \${(props) => props.theme.colors.text}1a;
\`;

export const CardHeader = styled.div\`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: \${(props) => props.theme.spacing.large};
\`;

export const CardTitle = styled.h3\`
  font-size: \${(props) => props.theme.fontSizes.large};
  font-weight: 600;
  line-height: 1;
  color: \${(props) => props.theme.colors.text};
\`;

export const CardDescription = styled.p\`
  font-size: \${(props) => props.theme.fontSizes.small};
  color: \${(props) => props.theme.colors.text}99;
\`;

export const CardContent = styled.div\`
  padding: \${(props) => props.theme.spacing.large};
  padding-top: 0;
\`;

export const CardFooter = styled.div\`
  display: flex;
  align-items: center;
  padding: \${(props) => props.theme.spacing.large};
  padding-top: 0;
\`;
`;
}

/**
 * Generate styled-components usage example page
 */
export function generateStyledComponentsUsageExample(): string {
  return `'use client';

import styled from 'styled-components';
import { Button } from '@/components/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/Card';

const Container = styled.div\`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
\`;

const Title = styled.h1\`
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: \${(props) => props.theme.colors.text};
\`;

const Grid = styled.div\`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, 1fr);

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
\`;

const ButtonGroup = styled.div\`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
\`;

const Text = styled.p\`
  font-size: 0.875rem;
  color: \${(props) => props.theme.colors.text}99;
\`;

export default function ComponentsPage() {
  return (
    <Container>
      <Title>Component Examples</Title>
      
      <Grid>
        {/* Button Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Different button variants and sizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ButtonGroup>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button size="small">Small</Button>
              <Button size="default">Default</Button>
              <Button size="large">Large</Button>
            </ButtonGroup>
          </CardContent>
        </Card>

        {/* Card Example */}
        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>
              This is a card description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text>
              Cards can contain any content and are great for organizing
              information into distinct sections.
            </Text>
          </CardContent>
          <CardFooter>
            <Button variant="primary">Action</Button>
          </CardFooter>
        </Card>

        {/* Feature Cards */}
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Feature {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <Text>
                Description of feature {i} goes here.
              </Text>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}
`;
}

/**
 * Generate styled-components registry for Next.js App Router
 */
export function generateStyledComponentsRegistry(): string {
  return `'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
`;
}

/**
 * Generate CSS Modules example for home page
 */
export function generateCssModulesExample(): string {
  return `.container {
  min-height: 100vh;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.main {
  padding: 5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title {
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  text-align: center;
  color: rgb(var(--color-primary));
}

.description {
  margin: 2rem 0;
  line-height: 1.5;
  font-size: 1.5rem;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  max-width: 800px;
  margin-top: 3rem;
}

.card {
  padding: 1.5rem;
  border: 1px solid rgb(var(--color-foreground) / 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.card:hover {
  border-color: rgb(var(--color-primary));
  box-shadow: 0 4px 12px rgb(var(--color-primary) / 0.1);
}

.cardTitle {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: rgb(var(--color-primary));
}

.cardText {
  font-size: 1rem;
  color: rgb(var(--color-foreground) / 0.8);
}
`;
}

/**
 * Generate CSS Modules Button component
 */
export function generateCssModulesButton(): string {
  return `.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background-color: rgb(var(--color-primary));
  color: rgb(var(--color-background));
}

.primary:hover:not(:disabled) {
  background-color: rgb(var(--color-primary) / 0.9);
}

.secondary {
  background-color: rgb(var(--color-secondary));
  color: rgb(var(--color-foreground));
}

.secondary:hover:not(:disabled) {
  background-color: rgb(var(--color-secondary) / 0.8);
}

.outline {
  background-color: transparent;
  border: 1px solid rgb(var(--color-foreground) / 0.2);
  color: rgb(var(--color-foreground));
}

.outline:hover:not(:disabled) {
  background-color: rgb(var(--color-foreground) / 0.05);
}

.small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.large {
  padding: 0.625rem 2rem;
  font-size: 1rem;
}
`;
}

/**
 * Generate CSS Modules Button component TypeScript
 */
export function generateCssModulesButtonComponent(): string {
  return `import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'default' | 'large';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClass = styles[variant] || styles.primary;
  const sizeClass = size !== 'default' ? styles[size] : '';
  
  return (
    <button
      className={\`\${styles.button} \${variantClass} \${sizeClass} \${className}\`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
`;
}

/**
 * Generate CSS Modules Card component styles
 */
export function generateCssModulesCard(): string {
  return `.card {
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-foreground) / 0.1);
  background-color: rgb(var(--color-background));
  box-shadow: 0 1px 3px rgb(var(--color-foreground) / 0.1);
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1.5rem;
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1;
}

.description {
  font-size: 0.875rem;
  color: rgb(var(--color-foreground) / 0.6);
}

.content {
  padding: 1.5rem;
  padding-top: 0;
}

.footer {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  padding-top: 0;
}
`;
}

/**
 * Generate CSS Modules Card component TypeScript
 */
export function generateCssModulesCardComponent(): string {
  return `import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={\`\${styles.card} \${className}\`.trim()}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={\`\${styles.header} \${className}\`.trim()}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: CardProps) {
  return (
    <h3 className={\`\${styles.title} \${className}\`.trim()}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: CardProps) {
  return (
    <p className={\`\${styles.description} \${className}\`.trim()}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: CardProps) {
  return (
    <div className={\`\${styles.content} \${className}\`.trim()}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: CardProps) {
  return (
    <div className={\`\${styles.footer} \${className}\`.trim()}>
      {children}
    </div>
  );
}
`;
}

/**
 * Generate CSS Modules usage example page
 */
export function generateCssModulesUsageExample(): string {
  return `import { Button } from '@/components/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/Card';
import styles from './page.module.css';

export default function ComponentsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Component Examples</h1>
      
      <div className={styles.grid}>
        {/* Button Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Different button variants and sizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.buttonGroup}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
            <div className={styles.buttonGroup}>
              <Button size="small">Small</Button>
              <Button size="default">Default</Button>
              <Button size="large">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Example */}
        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>
              This is a card description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={styles.text}>
              Cards can contain any content and are great for organizing
              information into distinct sections.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="primary">Action</Button>
          </CardFooter>
        </Card>

        {/* Feature Cards */}
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Feature {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={styles.text}>
                Description of feature {i} goes here.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
`;
}

/**
 * Generate CSS Modules usage example page styles
 */
export function generateCssModulesUsageExampleStyles(): string {
  return `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
}

.title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: rgb(var(--color-foreground));
}

.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.buttonGroup {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.text {
  font-size: 0.875rem;
  color: rgb(var(--color-foreground) / 0.6);
}
`;
}

/**
 * Generate utils file for Tailwind (cn helper)
 */
export function generateTailwindUtils(): string {
  return `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
}

/**
 * Generate shadcn Button component
 */
export function generateShadcnButton(): string {
  return `import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-red-500 text-white shadow-sm hover:bg-red-500/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
`;
}

/**
 * Generate shadcn Card component
 */
export function generateShadcnCard(): string {
  return `import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-background text-foreground shadow',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
`;
}

/**
 * Generate shadcn Input component
 */
export function generateShadcnInput(): string {
  return `import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
`;
}

/**
 * Generate shadcn component usage example page
 */
export function generateShadcnUsageExample(_config: ScaffoldConfig): string {
  return `import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ComponentsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Component Examples</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Button Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Different button variants and sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Input Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>
              Form input components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Email" type="email" />
            <Input placeholder="Password" type="password" />
            <Input placeholder="Disabled" disabled />
          </CardContent>
        </Card>

        {/* Card Example */}
        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>
              This is a card description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cards can contain any content and are great for organizing
              information into distinct sections.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Action</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Feature Grid */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Feature Grid</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Feature {i}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Description of feature {i} goes here.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}
