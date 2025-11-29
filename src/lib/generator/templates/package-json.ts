import { ScaffoldConfigWithFramework } from '@/types';

/**
 * Generate package.json for different project types
 * 
 * Security Note: Dependencies use caret (^) ranges for flexibility while
 * maintaining compatibility. For production, consider:
 * 1. Using package-lock.json (npm) or pnpm-lock.yaml (pnpm) to lock exact versions
 * 2. Running `npm audit` regularly to check for vulnerabilities
 * 3. Keeping dependencies updated with security patches
 * 4. Using tools like Dependabot or Renovate for automated updates
 */
export function generatePackageJson(config: ScaffoldConfigWithFramework): string {
  // Use projectStructure for more accurate routing
  if (config.projectStructure === 'fullstack-monorepo') {
    return generateMonorepoPackageJson(config);
  } else if (config.projectStructure === 'react-spa') {
    return generateReactSpaPackageJson(config);
  } else if (config.projectStructure === 'express-api-only') {
    return generateExpressPackageJson(config);
  } else if (config.projectStructure === 'nextjs-only') {
    return generateNextJsPackageJson(config);
  }
  
  // Fallback to legacy framework field
  if (config.framework === 'monorepo') {
    return generateMonorepoPackageJson(config);
  } else if (config.framework === 'next') {
    return generateNextJsPackageJson(config);
  } else {
    return generateExpressPackageJson(config);
  }
}

/**
 * Generate monorepo root package.json
 */
function generateMonorepoPackageJson(config: ScaffoldConfigWithFramework): string {
  const pkg = {
    name: config.projectName,
    version: '0.1.0',
    private: true,
    description: config.description,
    engines: {
      node: '>=20.0.0',
      npm: '>=10.0.0',
    },
    workspaces: ['apps/*', 'packages/*'],
    scripts: {
      dev: 'turbo run dev',
      build: 'turbo run build',
      lint: 'turbo run lint',
      clean: 'turbo run clean',
      format: config.extras.prettier ? 'prettier --write "**/*.{ts,tsx,js,jsx,json,md}"' : undefined,
      prepare: config.extras.husky ? 'husky install' : undefined,
    },
    devDependencies: {
      turbo: '^2.0.0',
      typescript: '^5.3.0',
      '@types/node': '^20.0.0',
      prettier: config.extras.prettier ? '^3.1.0' : undefined,
      husky: config.extras.husky ? '^8.0.0' : undefined,
      '@commitlint/cli': config.extras.husky ? '^18.4.0' : undefined,
      '@commitlint/config-conventional': config.extras.husky ? '^18.4.0' : undefined,
    },
  };

  // Remove undefined values
  Object.keys(pkg.scripts).forEach(
    (key) => (pkg.scripts as any)[key] === undefined && delete (pkg.scripts as any)[key]
  );
  Object.keys(pkg.devDependencies).forEach(
    (key) => (pkg.devDependencies as any)[key] === undefined && delete (pkg.devDependencies as any)[key]
  );

  return JSON.stringify(pkg, null, 2);
}

/**
 * Generate Next.js package.json
 */
function generateNextJsPackageJson(config: ScaffoldConfigWithFramework): string {
  const dependencies: Record<string, string> = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    next: '^15.0.0',
  };

  const devDependencies: Record<string, string> = {
    typescript: '^5.3.0',
    '@types/node': '^20.0.0',
    '@types/react': '^18.2.0',
    '@types/react-dom': '^18.2.0',
  };

  // Add styling dependencies
  if (config.styling === 'tailwind') {
    dependencies['tailwindcss'] = '^3.4.0';
    dependencies['autoprefixer'] = '^10.4.0';
    dependencies['postcss'] = '^8.4.0';
  } else if (config.styling === 'styled-components') {
    dependencies['styled-components'] = '^6.1.0';
    devDependencies['@types/styled-components'] = '^5.1.0';
  }

  // Add shadcn/ui dependencies
  if (config.shadcn) {
    dependencies['@radix-ui/react-slot'] = '^1.0.0';
    dependencies['class-variance-authority'] = '^0.7.0';
    dependencies['clsx'] = '^2.0.0';
    dependencies['tailwind-merge'] = '^2.0.0';
    dependencies['lucide-react'] = '^0.300.0';
    dependencies['tailwindcss-animate'] = '^1.0.0';
  }

  // Add auth dependencies
  if (config.auth === 'nextauth') {
    dependencies['next-auth'] = '^4.24.0';
    // Add Prisma adapter if using Prisma
    if (config.database === 'prisma-postgres') {
      dependencies['@auth/prisma-adapter'] = '^1.0.0';
    }
  } else if (config.auth === 'supabase') {
    dependencies['@supabase/supabase-js'] = '^2.39.0';
  } else if (config.auth === 'clerk') {
    dependencies['@clerk/nextjs'] = '^4.29.0';
  }

  // Add database dependencies
  if (config.database === 'prisma-postgres') {
    dependencies['@prisma/client'] = '^5.8.0';
    devDependencies['prisma'] = '^5.8.0';
  } else if (config.database === 'drizzle-postgres') {
    dependencies['drizzle-orm'] = '^0.29.0';
    dependencies['postgres'] = '^3.4.0';
    devDependencies['drizzle-kit'] = '^0.20.0';
  } else if (config.database === 'mongodb') {
    dependencies['mongodb'] = '^6.3.0';
  }

  // Add API layer dependencies
  if (config.api === 'rest-axios') {
    dependencies['axios'] = '^1.6.0';
  } else if (config.api === 'trpc') {
    dependencies['@trpc/server'] = '^10.45.0';
    dependencies['@trpc/client'] = '^10.45.0';
    dependencies['@trpc/react-query'] = '^10.45.0';
    dependencies['@tanstack/react-query'] = '^5.17.0';
    dependencies['zod'] = '^3.22.0';
  } else if (config.api === 'graphql') {
    dependencies['@apollo/client'] = '^3.8.0';
    dependencies['@apollo/server'] = '^4.10.0';
    dependencies['@as-integrations/next'] = '^3.0.0';
    dependencies['graphql'] = '^16.8.0';
    dependencies['graphql-tag'] = '^2.12.0';
    dependencies['@apollo/experimental-nextjs-app-support'] = '^0.8.0';
  }

  // Add AI dependencies
  if (config.aiTemplate && config.aiTemplate !== 'none') {
    dependencies['@anthropic-ai/sdk'] = '^0.17.0';
  }

  // Add extras
  if (config.extras.redis) {
    dependencies['ioredis'] = '^5.3.0';
    devDependencies['@types/ioredis'] = '^5.0.0';
  }

  if (config.extras.prettier) {
    devDependencies['prettier'] = '^3.1.0';
  }

  // Add Husky dependencies
  if (config.extras.husky) {
    devDependencies['husky'] = '^8.0.0';
    devDependencies['@commitlint/cli'] = '^18.4.0';
    devDependencies['@commitlint/config-conventional'] = '^18.4.0';
  }

  const pkg: any = {
    name: config.projectName,
    version: '0.1.0',
    private: true,
    description: config.description,
    engines: {
      node: '>=20.0.0',
      npm: '>=10.0.0',
    },
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      format: config.extras.prettier ? 'prettier --write "**/*.{ts,tsx,js,jsx,json,md}"' : undefined,
      prepare: config.extras.husky ? 'husky install' : undefined,
    },
    dependencies,
    devDependencies,
  };

  // Remove undefined values
  Object.keys(pkg.scripts).forEach(
    (key) => pkg.scripts[key] === undefined && delete pkg.scripts[key]
  );

  return JSON.stringify(pkg, null, 2);
}

/**
 * Generate React SPA package.json (Vite-based)
 */
function generateReactSpaPackageJson(config: ScaffoldConfigWithFramework): string {
  const dependencies: Record<string, string> = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  };

  const devDependencies: Record<string, string> = {
    typescript: '^5.3.0',
    '@types/node': '^20.0.0',
    '@types/react': '^18.2.0',
    '@types/react-dom': '^18.2.0',
    '@vitejs/plugin-react': '^4.2.0',
    vite: '^5.0.0',
    eslint: '^8.55.0',
  };

  // Add styling dependencies
  if (config.styling === 'tailwind') {
    dependencies['tailwindcss'] = '^3.4.0';
    dependencies['autoprefixer'] = '^10.4.0';
    dependencies['postcss'] = '^8.4.0';
  } else if (config.styling === 'styled-components') {
    dependencies['styled-components'] = '^6.1.0';
    devDependencies['@types/styled-components'] = '^5.1.0';
  }

  // Add API layer dependencies (client-side only)
  if (config.api === 'rest-axios') {
    dependencies['axios'] = '^1.6.0';
  }

  if (config.extras.prettier) {
    devDependencies['prettier'] = '^3.1.0';
  }

  const pkg: any = {
    name: config.projectName,
    version: '0.1.0',
    private: true,
    description: config.description,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      lint: 'eslint src --ext ts,tsx',
      format: config.extras.prettier ? 'prettier --write "**/*.{ts,tsx,js,jsx,json,md}"' : undefined,
    },
    dependencies,
    devDependencies,
  };

  // Remove undefined values
  Object.keys(pkg.scripts).forEach(
    (key) => pkg.scripts[key] === undefined && delete pkg.scripts[key]
  );

  return JSON.stringify(pkg, null, 2);
}

/**
 * Generate Express package.json
 */
function generateExpressPackageJson(config: ScaffoldConfigWithFramework): string {
  const dependencies: Record<string, string> = {
    express: '^4.18.0',
    cors: '^2.8.0',
    dotenv: '^16.3.0',
  };

  const devDependencies: Record<string, string> = {
    typescript: '^5.3.0',
    '@types/node': '^20.0.0',
    '@types/express': '^4.17.0',
    '@types/cors': '^2.8.0',
    'ts-node': '^10.9.0',
    'ts-node-dev': '^2.0.0',
  };

  // Add database dependencies
  if (config.database === 'prisma-postgres') {
    dependencies['@prisma/client'] = '^5.8.0';
    devDependencies['prisma'] = '^5.8.0';
  } else if (config.database === 'drizzle-postgres') {
    dependencies['drizzle-orm'] = '^0.29.0';
    dependencies['postgres'] = '^3.4.0';
    devDependencies['drizzle-kit'] = '^0.20.0';
  } else if (config.database === 'mongodb') {
    dependencies['mongodb'] = '^6.3.0';
  }

  // Add extras
  if (config.extras.redis) {
    dependencies['ioredis'] = '^5.3.0';
    devDependencies['@types/ioredis'] = '^5.0.0';
  }

  if (config.extras.prettier) {
    devDependencies['prettier'] = '^3.1.0';
  }

  if (config.extras.husky) {
    devDependencies['husky'] = '^8.0.0';
    devDependencies['@commitlint/cli'] = '^18.4.0';
    devDependencies['@commitlint/config-conventional'] = '^18.4.0';
  }

  const pkg: any = {
    name: config.projectName,
    version: '0.1.0',
    private: true,
    description: config.description,
    engines: {
      node: '>=20.0.0',
      npm: '>=10.0.0',
    },
    main: 'dist/index.js',
    scripts: {
      dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      lint: 'eslint src --ext .ts',
      format: config.extras.prettier ? 'prettier --write "**/*.{ts,js,json,md}"' : undefined,
      prepare: config.extras.husky ? 'husky install' : undefined,
    },
    dependencies,
    devDependencies,
  };

  // Remove undefined values
  Object.keys(pkg.scripts).forEach(
    (key) => pkg.scripts[key] === undefined && delete pkg.scripts[key]
  );

  return JSON.stringify(pkg, null, 2);
}

/**
 * Generate web app package.json for monorepo
 */
export function generateWebAppPackageJson(config: ScaffoldConfigWithFramework): string {
  const dependencies: Record<string, string> = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    next: '^15.0.0',
  };

  const devDependencies: Record<string, string> = {
    typescript: '^5.3.0',
    '@types/node': '^20.0.0',
    '@types/react': '^18.2.0',
    '@types/react-dom': '^18.2.0',
  };

  // Add styling dependencies
  if (config.styling === 'tailwind') {
    dependencies['tailwindcss'] = '^3.4.0';
    dependencies['autoprefixer'] = '^10.4.0';
    dependencies['postcss'] = '^8.4.0';
  }

  // Add shadcn/ui dependencies
  if (config.shadcn) {
    dependencies['@radix-ui/react-slot'] = '^1.0.0';
    dependencies['class-variance-authority'] = '^0.7.0';
    dependencies['clsx'] = '^2.0.0';
    dependencies['tailwind-merge'] = '^2.0.0';
    dependencies['lucide-react'] = '^0.300.0';
    dependencies['tailwindcss-animate'] = '^1.0.0';
  }

  // Add auth dependencies
  if (config.auth === 'nextauth') {
    dependencies['next-auth'] = '^4.24.0';
  } else if (config.auth === 'supabase') {
    dependencies['@supabase/supabase-js'] = '^2.39.0';
  } else if (config.auth === 'clerk') {
    dependencies['@clerk/nextjs'] = '^4.29.0';
  }

  // Add API layer dependencies
  if (config.api === 'rest-axios') {
    dependencies['axios'] = '^1.6.0';
  } else if (config.api === 'trpc') {
    dependencies['@trpc/client'] = '^10.45.0';
    dependencies['@trpc/react-query'] = '^10.45.0';
    dependencies['@tanstack/react-query'] = '^5.17.0';
  } else if (config.api === 'graphql') {
    dependencies['@apollo/client'] = '^3.8.0';
    dependencies['graphql'] = '^16.8.0';
    dependencies['@apollo/experimental-nextjs-app-support'] = '^0.8.0';
  }

  // Add AI dependencies
  if (config.aiTemplate && config.aiTemplate !== 'none') {
    dependencies['@anthropic-ai/sdk'] = '^0.17.0';
  }

  const pkg: any = {
    name: 'web',
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies,
    devDependencies,
  };

  return JSON.stringify(pkg, null, 2);
}

/**
 * Generate API app package.json for monorepo
 */
export function generateApiAppPackageJson(config: ScaffoldConfigWithFramework): string {
  const dependencies: Record<string, string> = {
    express: '^4.18.0',
    cors: '^2.8.0',
    dotenv: '^16.3.0',
  };

  const devDependencies: Record<string, string> = {
    typescript: '^5.3.0',
    '@types/node': '^20.0.0',
    '@types/express': '^4.17.0',
    '@types/cors': '^2.8.0',
    'ts-node-dev': '^2.0.0',
  };

  // Add database dependencies
  if (config.database === 'prisma-postgres') {
    dependencies['@prisma/client'] = '^5.8.0';
    devDependencies['prisma'] = '^5.8.0';
  } else if (config.database === 'drizzle-postgres') {
    dependencies['drizzle-orm'] = '^0.29.0';
    dependencies['postgres'] = '^3.4.0';
  }

  const pkg: any = {
    name: 'api',
    version: '0.1.0',
    private: true,
    main: 'dist/index.js',
    scripts: {
      dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
    },
    dependencies,
    devDependencies,
  };

  return JSON.stringify(pkg, null, 2);
}
