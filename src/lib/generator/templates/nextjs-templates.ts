import { ScaffoldConfigWithFramework } from '@/types';

/**
 * Generate Next.js app layout with optimized font loading
 */
export function generateNextJsLayout(config: ScaffoldConfigWithFramework): string {
  const isClerk = config.auth === 'clerk';

  return `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
${isClerk ? "import { ClerkProvider } from '@clerk/nextjs';" : ''}

// Optimize font loading with next/font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: '${config.projectName}',
  description: '${config.description}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    ${isClerk ? '<ClerkProvider>' : ''}
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
    ${isClerk ? '</ClerkProvider>' : ''}
  );
}
`;
}

/**
 * Generate Next.js home page
 */
export function generateNextJsHomePage(config: ScaffoldConfigWithFramework): string {
  return `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to ${config.projectName}
        </h1>
        <p className="text-lg mb-8">
          ${config.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Framework</h2>
            <p>${config.framework}</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Styling</h2>
            <p>${config.styling}</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Authentication</h2>
            <p>${config.auth}</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Database</h2>
            <p>${config.database}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
`;
}

/**
 * Generate Next.js config with bundle optimizations
 */
export function generateNextConfig(config: ScaffoldConfigWithFramework): string {
  const hasStyledComponents = config.styling === 'styled-components';
  
  return `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Bundle optimization
  compiler: {
    ${hasStyledComponents ? 'styledComponents: true,' : ''}
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ['@anthropic-ai/sdk', 'archiver', 'zustand'],
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Webpack optimizations for tree-shaking and code splitting
  webpack: (config, { isServer }) => {
    // Tree shaking optimization
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };
    
    // Split chunks for better caching
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
`;
}

/**
 * Generate turbo.json for monorepo
 */
export function generateTurboConfig(_config: ScaffoldConfigWithFramework): string {
  const turboConfig = {
    $schema: 'https://turbo.build/schema.json',
    globalDependencies: ['**/.env.*local'],
    pipeline: {
      build: {
        dependsOn: ['^build'],
        outputs: ['.next/**', '!.next/cache/**', 'dist/**'],
      },
      dev: {
        cache: false,
        persistent: true,
      },
      lint: {
        dependsOn: ['^lint'],
      },
      clean: {
        cache: false,
      },
    },
  };

  return JSON.stringify(turboConfig, null, 2);
}

/**
 * Generate shared types package.json
 */
export function generateSharedTypesPackageJson(): string {
  const pkg = {
    name: '@repo/shared-types',
    version: '0.1.0',
    private: true,
    main: './src/index.ts',
    types: './src/index.ts',
    dependencies: {},
    devDependencies: {
      typescript: '^5.3.0',
    },
  };

  return JSON.stringify(pkg, null, 2);
}

/**
 * Generate shared types index
 */
export function generateSharedTypesIndex(): string {
  return `export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
`;
}

/**
 * Generate config package package.json
 */
export function generateConfigPackageJson(): string {
  const pkg = {
    name: '@repo/config',
    version: '0.1.0',
    private: true,
    files: ['tsconfig.json', 'eslint.config.js'],
  };

  return JSON.stringify(pkg, null, 2);
}

/**
 * Generate app/api/hello/route.ts example API route
 * Only generated when projectStructure is 'nextjs-only'
 */
export function generateHelloApiRoute(): string {
  return `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Hello from Next.js API Routes!',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  return NextResponse.json({
    message: 'Data received',
    data: body,
    timestamp: new Date().toISOString(),
  });
}
`;
}

/**
 * Generate app/api/users/route.ts example API route
 * Only generated when projectStructure is 'nextjs-only'
 */
export function generateUsersApiRoute(): string {
  return `import { NextResponse } from 'next/server';

// Mock data for demonstration
const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
];

export async function GET() {
  return NextResponse.json({
    users,
    total: users.length,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newUser = {
    id: users.length + 1,
    name: body.name,
    email: body.email,
  };
  
  users.push(newUser);
  
  return NextResponse.json({
    message: 'User created successfully',
    user: newUser,
  }, { status: 201 });
}
`;
}
