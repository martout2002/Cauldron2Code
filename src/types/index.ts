import { z } from 'zod';

// ============================================================================
// Core Configuration Types
// ============================================================================

export interface ScaffoldConfig {
  // Project basics
  projectName: string;
  description: string;

  // Framework choices (new four-category structure)
  frontendFramework: 'nextjs' | 'react' | 'vue' | 'angular' | 'svelte';
  backendFramework: 'none' | 'nextjs-api' | 'express' | 'fastify' | 'nestjs';
  buildTool: 'auto' | 'vite' | 'webpack';
  projectStructure: 'nextjs-only' | 'react-spa' | 'fullstack-monorepo' | 'express-api-only';
  
  // Next.js specific (if applicable)
  nextjsRouter?: 'app' | 'pages';

  // Authentication
  auth: 'none' | 'nextauth' | 'supabase' | 'clerk';

  // Database & ORM
  database:
    | 'none'
    | 'prisma-postgres'
    | 'drizzle-postgres'
    | 'supabase'
    | 'mongodb';

  // API Layer
  api: 'rest-fetch' | 'rest-axios' | 'trpc' | 'graphql';

  // Styling
  styling: 'tailwind' | 'css-modules' | 'styled-components';
  shadcn: boolean;

  // Color Scheme
  colorScheme: 'purple' | 'gold' | 'white' | 'futuristic';

  // Deployment
  deployment: ('vercel' | 'railway' | 'render')[];

  // AI Templates
  aiTemplates: Array<'chatbot' | 'document-analyzer' | 'semantic-search' | 'code-assistant' | 'image-generator'>;
  aiProvider?: 'anthropic' | 'openai' | 'aws-bedrock' | 'gemini';

  // Tooling extras
  extras: {
    docker: boolean;
    githubActions: boolean;
    redis: boolean;
    prettier: boolean;
    husky: boolean;
  };
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationRule {
  id: string;
  message: string;
  severity: 'error' | 'warning';
  check: (config: ScaffoldConfig) => boolean;
}

// ============================================================================
// Color Scheme Types
// ============================================================================

export interface ColorSchemeConfig {
  name: string;
  displayName: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  cssVariables: Record<string, string>;
  tailwindExtend?: Record<string, any>;
}

// ============================================================================
// Documentation Types
// ============================================================================

export interface DocumentationSection {
  title: string;
  order: number;
  content: string;
  applicableWhen: (config: ScaffoldConfig) => boolean;
  subsections?: DocumentationSection[];
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

export const scaffoldConfigSchema = z.object({
  // Project basics
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .max(50, 'Project name must be 50 characters or less')
    .regex(
      /^[a-z0-9-]+$/,
      'Project name must be lowercase alphanumeric with hyphens only'
    ),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be 200 characters or less'),

  // Framework choices (new four-category structure)
  frontendFramework: z.enum(['nextjs', 'react', 'vue', 'angular', 'svelte'], {
    message: 'Invalid frontend framework selection',
  }),
  backendFramework: z.enum(['none', 'nextjs-api', 'express', 'fastify', 'nestjs'], {
    message: 'Invalid backend framework selection',
  }),
  buildTool: z.enum(['auto', 'vite', 'webpack'], {
    message: 'Invalid build tool selection',
  }),
  projectStructure: z.enum(['nextjs-only', 'react-spa', 'fullstack-monorepo', 'express-api-only'], {
    message: 'Invalid project structure selection',
  }),
  nextjsRouter: z.enum(['app', 'pages']).optional(),

  // Authentication
  auth: z.enum(['none', 'nextauth', 'supabase', 'clerk'], {
    message: 'Invalid authentication option',
  }),

  // Database & ORM
  database: z.enum(
    ['none', 'prisma-postgres', 'drizzle-postgres', 'supabase', 'mongodb'],
    {
      message: 'Invalid database option',
    }
  ),

  // API Layer
  api: z.enum(['rest-fetch', 'rest-axios', 'trpc', 'graphql'], {
    message: 'Invalid API layer option',
  }),

  // Styling
  styling: z.enum(['tailwind', 'css-modules', 'styled-components'], {
    message: 'Invalid styling option',
  }),
  shadcn: z.boolean(),

  // Color Scheme
  colorScheme: z.enum(['purple', 'gold', 'white', 'futuristic'], {
    message: 'Invalid color scheme',
  }),

  // Deployment (optional - users can deploy later)
  deployment: z
    .array(z.enum(['vercel', 'railway', 'render']))
    .max(3, 'Maximum 3 deployment targets allowed')
    .default([]),

  // AI Templates
  aiTemplates: z
    .array(
      z.enum([
        'chatbot',
        'document-analyzer',
        'semantic-search',
        'code-assistant',
        'image-generator',
      ])
    )
    .default([]),
  aiProvider: z
    .enum(['anthropic', 'openai', 'aws-bedrock', 'gemini'])
    .optional(),

  // Tooling extras
  extras: z.object({
    docker: z.boolean(),
    githubActions: z.boolean(),
    redis: z.boolean(),
    prettier: z.boolean(),
    husky: z.boolean(),
  }),
});

// ============================================================================
// Type inference from Zod schema
// ============================================================================

export type ScaffoldConfigInput = z.infer<typeof scaffoldConfigSchema>;

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  ruleId: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  ruleId: string;
}

// ============================================================================
// Helper Functions & Backward Compatibility
// ============================================================================

/**
 * Determine the legacy framework value based on new framework selections
 * Used for backward compatibility with existing generator code
 */
export function getFrameworkType(config: ScaffoldConfig): 'next' | 'express' | 'monorepo' {
  const { frontendFramework, backendFramework, projectStructure } = config;
  
  // Use projectStructure as primary indicator
  if (projectStructure === 'fullstack-monorepo') return 'monorepo';
  if (projectStructure === 'nextjs-only') return 'next';
  if (projectStructure === 'express-api-only') return 'express';
  
  // Fallback to framework combinations
  const hasNext = frontendFramework === 'nextjs';
  const hasExpress = backendFramework === 'express' || backendFramework === 'fastify' || backendFramework === 'nestjs';
  
  if (hasNext && hasExpress) return 'monorepo';
  if (hasNext) return 'next';
  if (hasExpress) return 'express';
  
  // Default to next if nothing selected
  return 'next';
}

/**
 * Extended config type with legacy framework property for backward compatibility
 * This allows existing generator code to work without changes
 */
export type ScaffoldConfigWithFramework = ScaffoldConfig & {
  framework: 'next' | 'express' | 'monorepo';
  aiTemplate?: 'chatbot' | 'document-analyzer' | 'semantic-search' | 'code-assistant' | 'image-generator' | 'none';
};

/**
 * Add the legacy framework property to config for backward compatibility
 */
export function addFrameworkProperty(config: ScaffoldConfig): ScaffoldConfigWithFramework {
  return {
    ...config,
    framework: getFrameworkType(config),
    aiTemplate: config.aiTemplates.length > 0 ? config.aiTemplates[0] : 'none',
  };
}

/**
 * Extended config type with legacy aiTemplate property for backward compatibility
 * This allows existing generator code to work without changes
 */
export type ScaffoldConfigWithLegacyAI = ScaffoldConfig & {
  aiTemplate?: 'chatbot' | 'document-analyzer' | 'semantic-search' | 'code-assistant' | 'image-generator' | 'none';
};

/**
 * Add the legacy aiTemplate property to config for backward compatibility
 * Converts aiTemplates array to singular aiTemplate field
 */
export function addLegacyAITemplate(config: ScaffoldConfig): ScaffoldConfigWithLegacyAI {
  return {
    ...config,
    aiTemplate: config.aiTemplates.length > 0 ? config.aiTemplates[0] : 'none',
  };
}

// ============================================================================
// Re-export Deployment Guides Types
// ============================================================================

export * from './deployment-guides';
