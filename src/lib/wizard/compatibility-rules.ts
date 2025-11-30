import { ScaffoldConfig } from '@/types';

/**
 * Represents the result of a compatibility evaluation
 */
export interface CompatibilityResult {
  /** Whether the option is compatible with the current configuration */
  isCompatible: boolean;
  
  /** Human-readable explanation of why the option is incompatible (if applicable) */
  reason?: string;
  
  /** The configuration field that conflicts with this option */
  conflictingField?: keyof ScaffoldConfig;
  
  /** The value of the conflicting field */
  conflictingValue?: string;
}

/**
 * Defines a compatibility rule that determines whether an option can be selected
 * based on the current configuration state
 */
export interface CompatibilityRule {
  /** Unique identifier for this rule */
  id: string;
  
  /** Human-readable description of what this rule enforces */
  description: string;
  
  /** The wizard step ID this rule applies to */
  targetStep: string;
  
  /** The option value this rule applies to */
  targetOption: string;
  
  /**
   * Function that determines if the option is incompatible with the current config
   * @param config - The current scaffold configuration
   * @returns true if the option is incompatible (should be disabled), false otherwise
   */
  isIncompatible: (config: ScaffoldConfig) => boolean;
  
  /**
   * Function that generates a user-friendly message explaining the incompatibility
   * @param config - The current scaffold configuration
   * @returns A message explaining why the option is disabled
   */
  getIncompatibilityMessage: (config: ScaffoldConfig) => string;
}

/**
 * Helper function to get a human-readable label for a configuration value
 */
function getOptionLabel(value: string): string {
  const labels: Record<string, string> = {
    // Frontend frameworks
    'nextjs': 'Next.js',
    'react': 'React',
    'vue': 'Vue',
    'angular': 'Angular',
    'svelte': 'Svelte',
    
    // Backend frameworks
    'none': 'None',
    'nextjs-api': 'Next.js API',
    'express': 'Express',
    'fastify': 'Fastify',
    'nestjs': 'NestJS',
    
    // Databases
    'prisma-postgres': 'Prisma + PostgreSQL',
    'drizzle-postgres': 'Drizzle + PostgreSQL',
    'supabase': 'Supabase',
    'mongodb': 'MongoDB',
    
    // Auth
    'nextauth': 'NextAuth',
    'clerk': 'Clerk',
    
    // Project structures
    'nextjs-only': 'Next.js Only',
    'react-spa': 'React SPA',
    'fullstack-monorepo': 'Fullstack Monorepo',
    'express-api-only': 'Express API Only',
  };
  
  return labels[value] || value;
}

/**
 * Centralized registry of all compatibility rules
 * Rules are evaluated to determine which options should be disabled in the wizard
 */
export const compatibilityRules: CompatibilityRule[] = [
  // ============================================================================
  // Frontend/Backend Compatibility Rules (Requirements 5.1, 5.2)
  // ============================================================================
  
  {
    id: 'backend-express-incompatible-with-nextjs',
    description: 'Express backend is incompatible with Next.js frontend',
    targetStep: 'backend',
    targetOption: 'express',
    isIncompatible: (config) => config.frontendFramework === 'nextjs',
    getIncompatibilityMessage: (config) => 
      `Express cannot be used with ${getOptionLabel(config.frontendFramework)}. Next.js has its own built-in API routes. Use "Next.js API" or select a different frontend framework.`,
  },
  
  {
    id: 'backend-fastify-incompatible-with-nextjs',
    description: 'Fastify backend is incompatible with Next.js frontend',
    targetStep: 'backend',
    targetOption: 'fastify',
    isIncompatible: (config) => config.frontendFramework === 'nextjs',
    getIncompatibilityMessage: (config) => 
      `Fastify cannot be used with ${getOptionLabel(config.frontendFramework)}. Next.js has its own built-in API routes. Use "Next.js API" or select a different frontend framework.`,
  },
  
  {
    id: 'backend-nestjs-incompatible-with-nextjs',
    description: 'NestJS backend is incompatible with Next.js frontend',
    targetStep: 'backend',
    targetOption: 'nestjs',
    isIncompatible: (config) => config.frontendFramework === 'nextjs',
    getIncompatibilityMessage: (config) => 
      `NestJS cannot be used with ${getOptionLabel(config.frontendFramework)}. Next.js has its own built-in API routes. Use "Next.js API" or select a different frontend framework.`,
  },
  
  {
    id: 'backend-nextjs-api-requires-nextjs-frontend',
    description: 'Next.js API requires Next.js as the frontend framework',
    targetStep: 'backend',
    targetOption: 'nextjs-api',
    isIncompatible: (config) => config.frontendFramework !== 'nextjs',
    getIncompatibilityMessage: (config) => 
      `Next.js API routes require Next.js as the frontend framework. Currently selected: ${getOptionLabel(config.frontendFramework)}. Change your frontend to Next.js or select a different backend.`,
  },
  
  // ============================================================================
  // Database/Auth Compatibility Rules (Requirements 6.2, 6.5)
  // ============================================================================
  
  {
    id: 'auth-supabase-incompatible-with-mongodb',
    description: 'Supabase Auth is incompatible with MongoDB database',
    targetStep: 'auth',
    targetOption: 'supabase',
    isIncompatible: (config) => config.database === 'mongodb',
    getIncompatibilityMessage: (config) => 
      `Supabase Auth requires Supabase as the database. Currently selected: ${getOptionLabel(config.database)}. Change your database to Supabase or select a different authentication provider.`,
  },
  
  {
    id: 'auth-supabase-incompatible-with-prisma',
    description: 'Supabase Auth is incompatible with Prisma + PostgreSQL',
    targetStep: 'auth',
    targetOption: 'supabase',
    isIncompatible: (config) => config.database === 'prisma-postgres',
    getIncompatibilityMessage: (config) => 
      `Supabase Auth requires Supabase as the database. Currently selected: ${getOptionLabel(config.database)}. Change your database to Supabase or select a different authentication provider.`,
  },
  
  {
    id: 'auth-supabase-incompatible-with-drizzle',
    description: 'Supabase Auth is incompatible with Drizzle + PostgreSQL',
    targetStep: 'auth',
    targetOption: 'supabase',
    isIncompatible: (config) => config.database === 'drizzle-postgres',
    getIncompatibilityMessage: (config) => 
      `Supabase Auth requires Supabase as the database. Currently selected: ${getOptionLabel(config.database)}. Change your database to Supabase or select a different authentication provider.`,
  },
  
  {
    id: 'auth-supabase-incompatible-with-no-database',
    description: 'Supabase Auth requires Supabase database',
    targetStep: 'auth',
    targetOption: 'supabase',
    isIncompatible: (config) => config.database === 'none',
    getIncompatibilityMessage: () => 
      `Supabase Auth requires Supabase as the database. Currently no database is selected. Change your database to Supabase or select a different authentication provider.`,
  },
  
  {
    id: 'auth-nextauth-requires-database',
    description: 'NextAuth requires a database for session storage',
    targetStep: 'auth',
    targetOption: 'nextauth',
    isIncompatible: (config) => config.database === 'none',
    getIncompatibilityMessage: () => 
      `NextAuth requires a database for session storage. Currently no database is selected. Select a database (Prisma, Drizzle, or MongoDB) or choose a different authentication provider.`,
  },
  
  // ============================================================================
  // Project Structure/Extras Compatibility Rules (Requirements 7.1, 7.4)
  // ============================================================================
  
  {
    id: 'extras-redis-requires-backend',
    description: 'Redis requires a backend framework',
    targetStep: 'extras',
    targetOption: 'redis',
    isIncompatible: (config) => config.backendFramework === 'none',
    getIncompatibilityMessage: () => 
      `Redis requires a backend framework to be useful. Currently no backend is selected. Select a backend framework (Express, Fastify, NestJS, or Next.js API) to use Redis.`,
  },
  
  // ============================================================================
  // AI Template Compatibility Rules (Requirements 1.5, 2.2, 4.2)
  // ============================================================================
  
  {
    id: 'ai-templates-require-nextjs-or-monorepo',
    description: 'AI templates require Next.js frontend or fullstack monorepo structure',
    targetStep: 'ai-templates',
    targetOption: 'chatbot',
    isIncompatible: (config) => !isAITemplateCompatible(config),
    getIncompatibilityMessage: (config) => 
      `AI templates require Next.js as the frontend framework or a fullstack monorepo structure. Currently selected: ${getOptionLabel(config.frontendFramework)} with ${getOptionLabel(config.projectStructure)} structure. Change your frontend to Next.js or select fullstack monorepo structure.`,
  },
  
  {
    id: 'ai-templates-document-analyzer-require-nextjs-or-monorepo',
    description: 'AI templates require Next.js frontend or fullstack monorepo structure',
    targetStep: 'ai-templates',
    targetOption: 'document-analyzer',
    isIncompatible: (config) => !isAITemplateCompatible(config),
    getIncompatibilityMessage: (config) => 
      `AI templates require Next.js as the frontend framework or a fullstack monorepo structure. Currently selected: ${getOptionLabel(config.frontendFramework)} with ${getOptionLabel(config.projectStructure)} structure. Change your frontend to Next.js or select fullstack monorepo structure.`,
  },
  
  {
    id: 'ai-templates-semantic-search-require-nextjs-or-monorepo',
    description: 'AI templates require Next.js frontend or fullstack monorepo structure',
    targetStep: 'ai-templates',
    targetOption: 'semantic-search',
    isIncompatible: (config) => !isAITemplateCompatible(config),
    getIncompatibilityMessage: (config) => 
      `AI templates require Next.js as the frontend framework or a fullstack monorepo structure. Currently selected: ${getOptionLabel(config.frontendFramework)} with ${getOptionLabel(config.projectStructure)} structure. Change your frontend to Next.js or select fullstack monorepo structure.`,
  },
  
  {
    id: 'ai-templates-code-assistant-require-nextjs-or-monorepo',
    description: 'AI templates require Next.js frontend or fullstack monorepo structure',
    targetStep: 'ai-templates',
    targetOption: 'code-assistant',
    isIncompatible: (config) => !isAITemplateCompatible(config),
    getIncompatibilityMessage: (config) => 
      `AI templates require Next.js as the frontend framework or a fullstack monorepo structure. Currently selected: ${getOptionLabel(config.frontendFramework)} with ${getOptionLabel(config.projectStructure)} structure. Change your frontend to Next.js or select fullstack monorepo structure.`,
  },
  
  {
    id: 'ai-templates-image-generator-require-nextjs-or-monorepo',
    description: 'AI templates require Next.js frontend or fullstack monorepo structure',
    targetStep: 'ai-templates',
    targetOption: 'image-generator',
    isIncompatible: (config) => !isAITemplateCompatible(config),
    getIncompatibilityMessage: (config) => 
      `AI templates require Next.js as the frontend framework or a fullstack monorepo structure. Currently selected: ${getOptionLabel(config.frontendFramework)} with ${getOptionLabel(config.projectStructure)} structure. Change your frontend to Next.js or select fullstack monorepo structure.`,
  },
];

// ============================================================================
// AI Template Compatibility Helper Functions
// ============================================================================

/**
 * Check if the current configuration is compatible with AI templates
 * AI templates require Next.js frontend or fullstack monorepo structure
 * 
 * @param config - The current scaffold configuration
 * @returns true if AI templates can be used, false otherwise
 * 
 * Requirements: 1.5, 4.2
 */
export function isAITemplateCompatible(config: ScaffoldConfig): boolean {
  return (
    config.frontendFramework === 'nextjs' ||
    config.projectStructure === 'fullstack-monorepo'
  );
}

/**
 * Get compatible AI providers based on selected templates
 * Currently all templates support all providers, but this function
 * allows for future filtering if specific templates require specific providers
 * 
 * @param selectedTemplates - Array of selected AI template IDs
 * @returns Array of compatible AI provider IDs
 * 
 * Requirements: 2.2
 */
export function getCompatibleAIProviders(
  selectedTemplates: string[]
): Array<'anthropic' | 'openai' | 'aws-bedrock' | 'gemini'> {
  // If no templates selected, return empty array
  if (selectedTemplates.length === 0) {
    return [];
  }
  
  // Currently all templates support all providers
  // In the future, this could filter based on template-specific requirements
  return ['anthropic', 'openai', 'aws-bedrock', 'gemini'];
}
