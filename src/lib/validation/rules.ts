import { ValidationRule } from '@/types';

/**
 * Validation rules for scaffold configuration
 * Based on design document requirements and known technology conflicts
 */
export const VALIDATION_RULES: ValidationRule[] = [
  // Framework compatibility rules (new four-category structure)
  {
    id: 'nextjs-api-requires-nextjs',
    message:
      'Next.js API routes require Next.js as the frontend framework.',
    severity: 'error',
    check: (config) =>
      config.backendFramework === 'nextjs-api' && config.frontendFramework !== 'nextjs',
  },
  {
    id: 'nextjs-only-structure',
    message:
      'Next.js only structure requires Next.js as frontend framework.',
    severity: 'error',
    check: (config) =>
      config.projectStructure === 'nextjs-only' && config.frontendFramework !== 'nextjs',
  },
  {
    id: 'express-api-only-no-frontend',
    message:
      'Express API only structure will not include frontend code.',
    severity: 'warning',
    check: (config) =>
      config.projectStructure === 'express-api-only',
  },
  {
    id: 'react-spa-no-backend',
    message:
      'React SPA structure will not include backend code. Consider Full-stack monorepo if you need a backend.',
    severity: 'warning',
    check: (config) =>
      config.projectStructure === 'react-spa' && config.backendFramework !== 'none',
  },
  {
    id: 'webpack-svelte-warning',
    message:
      'Vite is recommended for Svelte projects for better performance and developer experience.',
    severity: 'warning',
    check: (config) =>
      config.buildTool === 'webpack' && config.frontendFramework === 'svelte',
  },
  
  // Authentication and database rules
  {
    id: 'auth-database',
    message:
      'Authentication requires a database. Please select a database option.',
    severity: 'error',
    check: (config) => config.auth !== 'none' && config.database === 'none',
  },
  
  // Deployment rules
  {
    id: 'vercel-express',
    message:
      'Standalone Express apps cannot deploy to Vercel. Consider Render or Railway.',
    severity: 'error',
    check: (config) =>
      config.projectStructure === 'express-api-only' && config.deployment.includes('vercel'),
  },
  
  // API and architecture rules
  {
    id: 'trpc-monorepo',
    message:
      'tRPC works best with monorepo or Next.js. Consider using REST for standalone Express.',
    severity: 'warning',
    check: (config) =>
      config.api === 'trpc' && config.projectStructure === 'express-api-only',
  },
  {
    id: 'ai-framework-compatibility',
    message:
      'AI templates require Next.js frontend. Please select Next.js to use AI features.',
    severity: 'error',
    check: (config) =>
      config.aiTemplates.length > 0 &&
      config.frontendFramework !== 'nextjs',
  },
  {
    id: 'ai-api-key',
    message:
      "AI templates require an API key from your chosen AI provider. You'll need to add it to your environment after generation.",
    severity: 'warning',
    check: (config) =>
      config.aiTemplates.length > 0,
  },
  {
    id: 'supabase-auth-db',
    message:
      'When using Supabase auth, Supabase database is recommended for seamless integration.',
    severity: 'warning',
    check: (config) =>
      config.auth === 'supabase' && config.database !== 'supabase',
  },
  {
    id: 'nextjs-router-required',
    message:
      'Next.js framework requires a router selection (App Router or Pages Router).',
    severity: 'error',
    check: (config) =>
      config.frontendFramework === 'nextjs' &&
      !config.nextjsRouter,
  },
  {
    id: 'project-name-required',
    message: 'Project name is required and must be valid.',
    severity: 'error',
    check: (config) =>
      !config.projectName ||
      config.projectName.length === 0 ||
      !/^[a-z0-9-]+$/.test(config.projectName),
  },
  {
    id: 'description-required',
    message: 'Project description is required.',
    severity: 'error',
    check: (config) => !config.description || config.description.length === 0,
  },
  // Deployment is now optional - users can choose to deploy later
  // {
  //   id: 'deployment-target-required',
  //   message: 'At least one deployment target must be selected.',
  //   severity: 'error',
  //   check: (config) => config.deployment.length === 0,
  // },
  {
    id: 'graphql-complexity',
    message:
      'GraphQL setup requires additional configuration. Ensure you understand the setup requirements.',
    severity: 'warning',
    check: (config) => config.api === 'graphql',
  },
  {
    id: 'mongodb-auth-compatibility',
    message:
      'MongoDB works best with Clerk or custom auth. NextAuth with MongoDB requires additional adapter configuration.',
    severity: 'warning',
    check: (config) =>
      config.database === 'mongodb' && config.auth === 'nextauth',
  },
  {
    id: 'docker-deployment-recommendation',
    message:
      'Docker is recommended when deploying to Railway for consistent environments.',
    severity: 'warning',
    check: (config) =>
      config.deployment.includes('railway') &&
      !config.extras.docker,
  },
];

/**
 * Get validation rules by severity
 */
export function getRulesBySeverity(
  severity: 'error' | 'warning'
): ValidationRule[] {
  return VALIDATION_RULES.filter((rule) => rule.severity === severity);
}

/**
 * Get validation rule by ID
 */
export function getRuleById(id: string): ValidationRule | undefined {
  return VALIDATION_RULES.find((rule) => rule.id === id);
}
