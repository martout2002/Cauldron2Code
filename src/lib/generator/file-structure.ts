import { ScaffoldConfig, ScaffoldConfigWithFramework } from '@/types';
import { DirectoryStructure } from './template-engine';

/**
 * Get Next.js only structure (frontend + API routes in single Next.js app)
 */
export function getNextJsOnlyStructure(): DirectoryStructure[] {
  return [
    { path: 'src' },
    { path: 'src/app' },
    { path: 'src/app/api' }, // API routes directory
    { path: 'src/components' },
    { path: 'src/lib' },
    { path: 'public' },
  ];
}

/**
 * Get React SPA structure (frontend only)
 */
export function getReactSpaStructure(): DirectoryStructure[] {
  return [
    { path: 'src' },
    { path: 'src/components' },
    { path: 'src/pages' },
    { path: 'src/hooks' },
    { path: 'src/utils' },
    { path: 'src/lib' },
    { path: 'public' },
  ];
}

/**
 * Get Full-stack monorepo structure (apps/web + apps/api)
 */
export function getFullStackMonorepoStructure(): DirectoryStructure[] {
  return [
    { path: 'apps' },
    { path: 'apps/web' },
    { path: 'apps/web/src' },
    { path: 'apps/web/src/app' },
    { path: 'apps/web/src/components' },
    { path: 'apps/web/src/lib' },
    { path: 'apps/web/public' },
    { path: 'apps/api' },
    { path: 'apps/api/src' },
    { path: 'apps/api/src/routes' },
    { path: 'apps/api/src/middleware' },
    { path: 'packages' },
    { path: 'packages/shared-types' },
    { path: 'packages/shared-types/src' },
    { path: 'packages/config' },
    { path: 'docs' },
  ];
}

/**
 * Get Express API only structure (backend only, no frontend)
 */
export function getExpressApiOnlyStructure(): DirectoryStructure[] {
  return [
    { path: 'src' },
    { path: 'src/routes' },
    { path: 'src/controllers' },
    { path: 'src/middleware' },
    { path: 'src/models' },
    { path: 'src/utils' },
    { path: 'src/lib' },
  ];
}

/**
 * Generate directory structure based on configuration
 */
export function getDirectoryStructure(
  config: ScaffoldConfig | ScaffoldConfigWithFramework
): DirectoryStructure[] {
  const dirs: DirectoryStructure[] = [];

  // Use projectStructure to determine base structure
  const projectStructure = config.projectStructure;
  
  if (projectStructure === 'fullstack-monorepo') {
    dirs.push(...getFullStackMonorepoStructure());
  } else if (projectStructure === 'nextjs-only') {
    dirs.push(...getNextJsOnlyStructure());
  } else if (projectStructure === 'react-spa') {
    dirs.push(...getReactSpaStructure());
  } else if (projectStructure === 'express-api-only') {
    dirs.push(...getExpressApiOnlyStructure());
  } else {
    // Fallback to legacy framework field if projectStructure is not set
    const framework = 'framework' in config ? config.framework : 'next';
    
    if (framework === 'monorepo') {
      dirs.push(...getFullStackMonorepoStructure());
    } else if (framework === 'next') {
      dirs.push(...getNextJsOnlyStructure());
    } else if (framework === 'express') {
      dirs.push(...getExpressApiOnlyStructure());
    }
  }

  // Determine base path based on project structure
  const isMonorepo = projectStructure === 'fullstack-monorepo';
  const isExpressOnly = projectStructure === 'express-api-only';
  const basePath = isMonorepo ? 'apps/web/src' : 'src';

  // Add auth-specific directories (only for projects with frontend)
  if (!isExpressOnly) {
    if (config.auth === 'nextauth') {
      dirs.push(
        { path: `${basePath}/app/api/auth/[...nextauth]` },
        { path: `${basePath}/app/auth/signin` },
        { path: `${basePath}/app/auth/error` }
      );
    } else if (config.auth === 'clerk') {
      dirs.push(
        { path: `${basePath}/app/sign-in/[[...sign-in]]` },
        { path: `${basePath}/app/sign-up/[[...sign-up]]` }
      );
    } else if (config.auth === 'supabase') {
      dirs.push({ path: 'supabase' }, { path: 'supabase/migrations' });
    }
  }

  // Add database-specific directories
  if (config.database === 'prisma-postgres') {
    dirs.push({ path: 'prisma' }, { path: 'scripts' });
  } else if (config.database === 'drizzle-postgres') {
    dirs.push({ path: 'drizzle' }, { path: 'scripts' });
    dirs.push({ path: `${basePath}/lib/db` });
  } else if (config.database === 'supabase' && config.auth !== 'supabase') {
    dirs.push({ path: 'supabase' }, { path: 'supabase/migrations' });
  }

  // Add AI template directories (only for projects with frontend)
  if (!isExpressOnly && config.aiTemplate && config.aiTemplate !== 'none') {
    // Add specific directories based on AI template
    if (config.aiTemplate === 'chatbot') {
      dirs.push(
        { path: `${basePath}/app/api/chat` },
        { path: `${basePath}/app/chat` }
      );
    } else if (config.aiTemplate === 'document-analyzer') {
      dirs.push(
        { path: `${basePath}/app/api/analyze` },
        { path: `${basePath}/app/analyze` }
      );
    } else if (config.aiTemplate === 'semantic-search') {
      dirs.push(
        { path: `${basePath}/app/api/search` },
        { path: `${basePath}/app/search` }
      );
    } else if (config.aiTemplate === 'code-assistant') {
      dirs.push(
        { path: `${basePath}/app/api/code-assistant` },
        { path: `${basePath}/app/code-assistant` }
      );
    } else if (config.aiTemplate === 'image-generator') {
      dirs.push(
        { path: `${basePath}/app/api/generate-image` },
        { path: `${basePath}/app/generate-image` }
      );
    }
  }

  // Add deployment-specific directories
  if (config.extras.docker) {
    dirs.push({ path: '.docker' });
  }

  if (config.extras.githubActions) {
    dirs.push({ path: '.github' }, { path: '.github/workflows' });
  }

  // EC2 deployment removed - use Vercel, Railway, or Render instead

  return dirs;
}

/**
 * Generate file path based on framework and file type
 */
export function getFilePath(
  config: ScaffoldConfig | ScaffoldConfigWithFramework,
  fileType: string,
  fileName: string
): string {
  const projectStructure = config.projectStructure;
  const isMonorepo = projectStructure === 'fullstack-monorepo';
  const isNextOnly = projectStructure === 'nextjs-only';
  const isReactSpa = projectStructure === 'react-spa';
  const isExpressOnly = projectStructure === 'express-api-only';

  switch (fileType) {
    case 'root':
      return fileName;

    case 'app':
      if (isMonorepo) {
        return `apps/web/src/app/${fileName}`;
      } else if (isNextOnly) {
        return `src/app/${fileName}`;
      } else if (isReactSpa) {
        return `src/${fileName}`;
      }
      return fileName;

    case 'component':
      if (isMonorepo) {
        return `apps/web/src/components/${fileName}`;
      } else if (isNextOnly || isReactSpa) {
        return `src/components/${fileName}`;
      }
      return `src/components/${fileName}`;

    case 'lib':
      if (isMonorepo) {
        return `apps/web/src/lib/${fileName}`;
      } else if (isNextOnly || isReactSpa) {
        return `src/lib/${fileName}`;
      }
      return `src/lib/${fileName}`;

    case 'api-route':
      if (isMonorepo) {
        return `apps/api/src/routes/${fileName}`;
      } else if (isExpressOnly) {
        return `src/routes/${fileName}`;
      } else if (isNextOnly) {
        return `src/app/api/${fileName}`;
      }
      return `src/app/api/${fileName}`;

    case 'public':
      if (isMonorepo) {
        return `apps/web/public/${fileName}`;
      } else if (isNextOnly || isReactSpa) {
        return `public/${fileName}`;
      }
      return `public/${fileName}`;

    case 'config':
      return fileName;

    case 'docs':
      if (isMonorepo) {
        return `docs/${fileName}`;
      }
      return fileName;

    default:
      return fileName;
  }
}

/**
 * Normalize project name for use in file paths and package names
 */
export function normalizeProjectName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

/**
 * Convert project name to PascalCase for component names
 */
export function toPascalCase(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Convert project name to camelCase for variable names
 */
export function toCamelCase(name: string): string {
  const pascal = toPascalCase(name);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
