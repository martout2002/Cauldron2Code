import { ScaffoldConfig } from '@/types';
import { DirectoryStructure } from './template-engine';

/**
 * Generate directory structure based on configuration
 */
export function getDirectoryStructure(
  config: ScaffoldConfig
): DirectoryStructure[] {
  const dirs: DirectoryStructure[] = [];

  if (config.framework === 'monorepo') {
    // Monorepo structure
    dirs.push(
      { path: 'apps' },
      { path: 'apps/web' },
      { path: 'apps/web/src' },
      { path: 'apps/web/src/app' },
      { path: 'apps/web/src/components' },
      { path: 'apps/web/src/lib' },
      { path: 'apps/web/public' },
      { path: 'apps/api', condition: (cfg) => cfg.framework === 'monorepo' },
      { path: 'apps/api/src', condition: (cfg) => cfg.framework === 'monorepo' },
      {
        path: 'apps/api/src/routes',
        condition: (cfg) => cfg.framework === 'monorepo',
      },
      { path: 'packages' },
      { path: 'packages/shared-types' },
      { path: 'packages/shared-types/src' },
      { path: 'packages/config' },
      { path: 'docs' }
    );
  } else if (config.framework === 'next') {
    // Next.js standalone structure
    dirs.push(
      { path: 'src' },
      { path: 'src/app' },
      { path: 'src/components' },
      { path: 'src/lib' },
      { path: 'public' }
    );
  } else if (config.framework === 'express') {
    // Express standalone structure
    dirs.push(
      { path: 'src' },
      { path: 'src/routes' },
      { path: 'src/middleware' },
      { path: 'src/lib' }
    );
  }

  // Add auth-specific directories
  if (config.auth === 'nextauth') {
    const basePath = config.framework === 'monorepo' ? 'apps/web/src' : 'src';
    dirs.push(
      { path: `${basePath}/app/api/auth/[...nextauth]` },
      { path: `${basePath}/app/auth/signin` },
      { path: `${basePath}/app/auth/error` }
    );
  } else if (config.auth === 'clerk') {
    const basePath = config.framework === 'monorepo' ? 'apps/web/src' : 'src';
    dirs.push(
      { path: `${basePath}/app/sign-in/[[...sign-in]]` },
      { path: `${basePath}/app/sign-up/[[...sign-up]]` }
    );
  } else if (config.auth === 'supabase') {
    dirs.push({ path: 'supabase' }, { path: 'supabase/migrations' });
  }

  // Add database-specific directories
  if (config.database === 'prisma-postgres') {
    dirs.push({ path: 'prisma' }, { path: 'scripts' });
  } else if (config.database === 'drizzle-postgres') {
    dirs.push({ path: 'drizzle' }, { path: 'scripts' });
    const basePath = config.framework === 'monorepo' ? 'apps/web/src' : 'src';
    dirs.push({ path: `${basePath}/lib/db` });
  } else if (config.database === 'supabase' && config.auth !== 'supabase') {
    dirs.push({ path: 'supabase' }, { path: 'supabase/migrations' });
  }

  // Add AI template directories
  if (config.aiTemplate && config.aiTemplate !== 'none') {
    if (config.framework === 'monorepo') {
      dirs.push({ path: 'apps/web/src/app/api' });
      
      // Add specific directories based on AI template
      if (config.aiTemplate === 'chatbot') {
        dirs.push(
          { path: 'apps/web/src/app/api/chat' },
          { path: 'apps/web/src/app/chat' }
        );
      } else if (config.aiTemplate === 'document-analyzer') {
        dirs.push(
          { path: 'apps/web/src/app/api/analyze' },
          { path: 'apps/web/src/app/analyze' }
        );
      } else if (config.aiTemplate === 'semantic-search') {
        dirs.push(
          { path: 'apps/web/src/app/api/search' },
          { path: 'apps/web/src/app/search' }
        );
      } else if (config.aiTemplate === 'code-assistant') {
        dirs.push(
          { path: 'apps/web/src/app/api/code-assistant' },
          { path: 'apps/web/src/app/code-assistant' }
        );
      } else if (config.aiTemplate === 'image-generator') {
        dirs.push(
          { path: 'apps/web/src/app/api/generate-image' },
          { path: 'apps/web/src/app/generate-image' }
        );
      }
    } else if (config.framework === 'next') {
      dirs.push({ path: 'src/app/api' });
      
      // Add specific directories based on AI template
      if (config.aiTemplate === 'chatbot') {
        dirs.push(
          { path: 'src/app/api/chat' },
          { path: 'src/app/chat' }
        );
      } else if (config.aiTemplate === 'document-analyzer') {
        dirs.push(
          { path: 'src/app/api/analyze' },
          { path: 'src/app/analyze' }
        );
      } else if (config.aiTemplate === 'semantic-search') {
        dirs.push(
          { path: 'src/app/api/search' },
          { path: 'src/app/search' }
        );
      } else if (config.aiTemplate === 'code-assistant') {
        dirs.push(
          { path: 'src/app/api/code-assistant' },
          { path: 'src/app/code-assistant' }
        );
      } else if (config.aiTemplate === 'image-generator') {
        dirs.push(
          { path: 'src/app/api/generate-image' },
          { path: 'src/app/generate-image' }
        );
      }
    }
  }

  // Add deployment-specific directories
  if (config.extras.docker) {
    dirs.push({ path: '.docker' });
  }

  if (config.extras.githubActions) {
    dirs.push({ path: '.github' }, { path: '.github/workflows' });
  }

  if (config.deployment.includes('ec2')) {
    dirs.push({ path: 'deploy' });
  }

  return dirs;
}

/**
 * Generate file path based on framework and file type
 */
export function getFilePath(
  config: ScaffoldConfig,
  fileType: string,
  fileName: string
): string {
  const isMonorepo = config.framework === 'monorepo';
  const isNext = config.framework === 'next' || isMonorepo;
  const isExpress = config.framework === 'express';

  switch (fileType) {
    case 'root':
      return fileName;

    case 'app':
      if (isMonorepo) {
        return `apps/web/src/app/${fileName}`;
      } else if (isNext) {
        return `src/app/${fileName}`;
      }
      return fileName;

    case 'component':
      if (isMonorepo) {
        return `apps/web/src/components/${fileName}`;
      } else if (isNext) {
        return `src/components/${fileName}`;
      }
      return `src/components/${fileName}`;

    case 'lib':
      if (isMonorepo) {
        return `apps/web/src/lib/${fileName}`;
      } else if (isNext) {
        return `src/lib/${fileName}`;
      }
      return `src/lib/${fileName}`;

    case 'api-route':
      if (isMonorepo) {
        return `apps/api/src/routes/${fileName}`;
      } else if (isExpress) {
        return `src/routes/${fileName}`;
      }
      return `src/app/api/${fileName}`;

    case 'public':
      if (isMonorepo) {
        return `apps/web/public/${fileName}`;
      } else if (isNext) {
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
