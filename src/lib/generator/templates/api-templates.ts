import { ScaffoldConfigWithFramework } from '@/types';

/**
 * Generate fetch-based REST API client
 */
export function generateFetchApiClient(config: ScaffoldConfigWithFramework): string {
  const isMonorepo = config.framework === 'monorepo';
  const apiUrl = isMonorepo
    ? "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'"
    : "''";

  return `/**
 * Fetch-based API client with error handling and retry logic
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(\`API Error: \${status} \${statusText}\`);
    this.name = 'ApiError';
  }
}

interface RequestConfig extends RequestInit {
  retry?: number;
  retryDelay?: number;
}

const API_BASE_URL = ${apiUrl};

/**
 * Make an API request with automatic retry logic
 */
async function fetchWithRetry(
  url: string,
  config: RequestConfig = {}
): Promise<Response> {
  const { retry = 3, retryDelay = 1000, ...fetchConfig } = config;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retry; attempt++) {
    try {
      const response = await fetch(url, fetchConfig);
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      // Retry on server errors (5xx) or network errors
      if (response.ok || attempt === retry - 1) {
        return response;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    } catch (error) {
      lastError = error as Error;
      if (attempt === retry - 1) {
        throw lastError;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  throw lastError || new Error('Request failed');
}

/**
 * Process API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, response.statusText, errorData);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return response.text() as any;
}

/**
 * GET request
 */
export async function get<T>(
  endpoint: string,
  config?: RequestConfig
): Promise<T> {
  const url = \`\${API_BASE_URL}\${endpoint}\`;
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...config,
  });

  return handleResponse<T>(response);
}

/**
 * POST request
 */
export async function post<T>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<T> {
  const url = \`\${API_BASE_URL}\${endpoint}\`;
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  });

  return handleResponse<T>(response);
}

/**
 * PUT request
 */
export async function put<T>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<T> {
  const url = \`\${API_BASE_URL}\${endpoint}\`;
  const response = await fetchWithRetry(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  });

  return handleResponse<T>(response);
}

/**
 * PATCH request
 */
export async function patch<T>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<T> {
  const url = \`\${API_BASE_URL}\${endpoint}\`;
  const response = await fetchWithRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  });

  return handleResponse<T>(response);
}

/**
 * DELETE request
 */
export async function del<T>(
  endpoint: string,
  config?: RequestConfig
): Promise<T> {
  const url = \`\${API_BASE_URL}\${endpoint}\`;
  const response = await fetchWithRetry(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...config,
  });

  return handleResponse<T>(response);
}

// Example usage:
// import { get, post } from '@/lib/api-client';
//
// const users = await get<User[]>('/api/users');
// const newUser = await post<User>('/api/users', { name: 'John', email: 'john@example.com' });
`;
}

/**
 * Generate axios-based REST API client
 */
export function generateAxiosApiClient(config: ScaffoldConfigWithFramework): string {
  const isMonorepo = config.framework === 'monorepo';
  const apiUrl = isMonorepo
    ? "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'"
    : "''";

  return `import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Axios-based API client with interceptors and retry logic
 */

const API_BASE_URL = ${apiUrl};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Retry logic for 5xx errors
    if (
      error.response?.status &&
      error.response.status >= 500 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

/**
 * API client methods
 */
export const api = {
  /**
   * GET request
   */
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  /**
   * POST request
   */
  post: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  /**
   * PUT request
   */
  put: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  /**
   * PATCH request
   */
  patch: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  /**
   * DELETE request
   */
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

export default api;

// Example usage:
// import api from '@/lib/api-client';
//
// const users = await api.get<User[]>('/api/users');
// const newUser = await api.post<User>('/api/users', { name: 'John', email: 'john@example.com' });
`;
}

/**
 * Generate REST API route examples for Next.js
 */
export function generateRestApiRouteExamples(config: ScaffoldConfigWithFramework): string {
  const hasDatabase = config.database !== 'none';
  const isPrisma = config.database === 'prisma-postgres';
  const isDrizzle = config.database === 'drizzle-postgres';
  
  const dbImport = isPrisma 
    ? "import { prisma as db } from '@/lib/prisma';" 
    : isDrizzle 
    ? "import { db } from '@/lib/db/db';"
    : "import { db } from '@/lib/db';";

  return `import { NextRequest, NextResponse } from 'next/server';
${hasDatabase ? dbImport : ''}

/**
 * Example REST API routes for ${config.projectName}
 */

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    ${hasDatabase ? `
    // Fetch users from database
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
    ` : `
    // Mock data (replace with actual database query)
    const users = [
      { id: '1', email: 'user1@example.com', name: 'User 1' },
      { id: '2', email: 'user2@example.com', name: 'User 2' },
    ];

    return NextResponse.json({
      success: true,
      data: users,
    });
    `}
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate input
    if (!email || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and name are required',
        },
        { status: 400 }
      );
    }

    ${hasDatabase ? `
    // Create user in database
    const user = await db.user.create({
      data: {
        email,
        name,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    );
    ` : `
    // Mock response (replace with actual database operation)
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      createdAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    );
    `}
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
      },
      { status: 500 }
    );
  }
}
`;
}

/**
 * Generate REST API route for single resource
 */
export function generateRestApiSingleResourceRoute(config: ScaffoldConfigWithFramework): string {
  const hasDatabase = config.database !== 'none';
  const isPrisma = config.database === 'prisma-postgres';
  const isDrizzle = config.database === 'drizzle-postgres';
  
  const dbImport = isPrisma 
    ? "import { prisma as db } from '@/lib/prisma';" 
    : isDrizzle 
    ? "import { db } from '@/lib/db/db';"
    : "import { db } from '@/lib/db';";

  return `import { NextRequest, NextResponse } from 'next/server';
${hasDatabase ? dbImport : ''}

/**
 * Dynamic route for single user: /api/users/[id]
 */

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    ${hasDatabase ? `
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
    ` : `
    // Mock data (replace with actual database query)
    const user = {
      id,
      email: 'user@example.com',
      name: 'User Name',
      createdAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: user,
    });
    `}
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, name } = body;

    ${hasDatabase ? `
    const user = await db.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(name && { name }),
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
    ` : `
    // Mock response (replace with actual database operation)
    const user = {
      id,
      email: email || 'user@example.com',
      name: name || 'User Name',
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: user,
    });
    `}
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    ${hasDatabase ? `
    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
    ` : `
    // Mock response (replace with actual database operation)
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
    `}
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
      },
      { status: 500 }
    );
  }
}
`;
}

/**
 * Generate tRPC router configuration
 */
export function generateTrpcRouter(config: ScaffoldConfigWithFramework): string {
  const hasDatabase = config.database !== 'none';

  return `import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
${hasDatabase ? "import { db } from '@/lib/db';" : ''}

/**
 * Initialize tRPC
 */
const t = initTRPC.create();

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Example tRPC router for ${config.projectName}
 */
export const appRouter = router({
  // Health check
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Get all users
  getUsers: publicProcedure.query(async () => {
    ${hasDatabase ? `
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    return users;
    ` : `
    // Mock data (replace with actual database query)
    return [
      { id: '1', email: 'user1@example.com', name: 'User 1', createdAt: new Date() },
      { id: '2', email: 'user2@example.com', name: 'User 2', createdAt: new Date() },
    ];
    `}
  }),

  // Get user by ID
  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      ${hasDatabase ? `
      const user = await db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
      ` : `
      // Mock data (replace with actual database query)
      return {
        id: input.id,
        email: 'user@example.com',
        name: 'User Name',
        createdAt: new Date(),
      };
      `}
    }),

  // Create user
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      ${hasDatabase ? `
      const user = await db.user.create({
        data: {
          email: input.email,
          name: input.name,
        },
      });

      return user;
      ` : `
      // Mock response (replace with actual database operation)
      return {
        id: Math.random().toString(36).substr(2, 9),
        email: input.email,
        name: input.name,
        createdAt: new Date(),
      };
      `}
    }),

  // Update user
  updateUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email().optional(),
        name: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      ${hasDatabase ? `
      const user = await db.user.update({
        where: { id: input.id },
        data: {
          ...(input.email && { email: input.email }),
          ...(input.name && { name: input.name }),
        },
      });

      return user;
      ` : `
      // Mock response (replace with actual database operation)
      return {
        id: input.id,
        email: input.email || 'user@example.com',
        name: input.name || 'User Name',
        updatedAt: new Date(),
      };
      `}
    }),

  // Delete user
  deleteUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      ${hasDatabase ? `
      await db.user.delete({
        where: { id: input.id },
      });

      return { success: true, message: 'User deleted successfully' };
      ` : `
      // Mock response (replace with actual database operation)
      return { success: true, message: 'User deleted successfully' };
      `}
    }),
});

// Export type router type signature
export type AppRouter = typeof appRouter;
`;
}

/**
 * Generate tRPC API route handler for Next.js
 */
export function generateTrpcApiRoute(): string {
  return `import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/lib/trpc/router';

/**
 * tRPC API route handler
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
`;
}

/**
 * Generate tRPC client setup
 */
export function generateTrpcClient(config: ScaffoldConfigWithFramework): string {
  const isMonorepo = config.framework === 'monorepo';
  const apiUrl = isMonorepo
    ? "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'"
    : "''";

  return `import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/lib/trpc/router';

/**
 * Create tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get tRPC client configuration
 */
export function getTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: \`\${${apiUrl}}/api/trpc\`,
        // Optional: Add headers
        // headers() {
        //   return {
        //     authorization: getAuthToken(),
        //   };
        // },
      }),
    ],
  });
}
`;
}

/**
 * Generate tRPC provider component
 */
export function generateTrpcProvider(): string {
  return `'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { trpc, getTrpcClient } from './client';

/**
 * tRPC Provider component
 */
export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => getTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
`;
}

/**
 * Generate tRPC usage example component
 */
export function generateTrpcUsageExample(): string {
  return `'use client';

import { trpc } from '@/lib/trpc/client';

/**
 * Example component using tRPC
 */
export default function UsersPage() {
  // Query example
  const { data: users, isLoading, error } = trpc.getUsers.useQuery();

  // Mutation example
  const createUser = trpc.createUser.useMutation({
    onSuccess: () => {
      // Invalidate and refetch users query
      trpc.useContext().getUsers.invalidate();
    },
  });

  const handleCreateUser = () => {
    createUser.mutate({
      email: 'newuser@example.com',
      name: 'New User',
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      
      <button
        onClick={handleCreateUser}
        disabled={createUser.isLoading}
        className="mb-4 px-4 py-2 bg-primary text-white rounded"
      >
        {createUser.isLoading ? 'Creating...' : 'Create User'}
      </button>

      <ul className="space-y-2">
        {users?.map((user) => (
          <li key={user.id} className="p-4 border rounded">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;
}

/**
 * Generate GraphQL schema
 */
export function generateGraphQLSchema(config: ScaffoldConfigWithFramework): string {
  const hasDatabase = config.database !== 'none';

  return `import { gql } from 'graphql-tag';

/**
 * GraphQL schema for ${config.projectName}
 */
export const typeDefs = gql\`
  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
  }

  type Query {
    health: Health!
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): DeleteUserResponse!
  }

  input CreateUserInput {
    email: String!
    name: String!
  }

  input UpdateUserInput {
    email: String
    name: String
  }

  type DeleteUserResponse {
    success: Boolean!
    message: String!
  }

  type Health {
    status: String!
    timestamp: String!
  }
\`;

/**
 * GraphQL resolvers
 */
export const resolvers = {
  Query: {
    health: () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),

    users: async () => {
      ${hasDatabase ? `
      const { db } = await import('@/lib/db');
      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
      return users;
      ` : `
      // Mock data (replace with actual database query)
      return [
        { id: '1', email: 'user1@example.com', name: 'User 1', createdAt: new Date().toISOString() },
        { id: '2', email: 'user2@example.com', name: 'User 2', createdAt: new Date().toISOString() },
      ];
      `}
    },

    user: async (_parent: any, { id }: { id: string }) => {
      ${hasDatabase ? `
      const { db } = await import('@/lib/db');
      const user = await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
      ` : `
      // Mock data (replace with actual database query)
      return {
        id,
        email: 'user@example.com',
        name: 'User Name',
        createdAt: new Date().toISOString(),
      };
      `}
    },
  },

  Mutation: {
    createUser: async (_parent: any, { input }: { input: { email: string; name: string } }) => {
      ${hasDatabase ? `
      const { db } = await import('@/lib/db');
      const user = await db.user.create({
        data: {
          email: input.email,
          name: input.name,
        },
      });

      return user;
      ` : `
      // Mock response (replace with actual database operation)
      return {
        id: Math.random().toString(36).substr(2, 9),
        email: input.email,
        name: input.name,
        createdAt: new Date().toISOString(),
      };
      `}
    },

    updateUser: async (
      _parent: any,
      { id, input }: { id: string; input: { email?: string; name?: string } }
    ) => {
      ${hasDatabase ? `
      const { db } = await import('@/lib/db');
      const user = await db.user.update({
        where: { id },
        data: {
          ...(input.email && { email: input.email }),
          ...(input.name && { name: input.name }),
        },
      });

      return user;
      ` : `
      // Mock response (replace with actual database operation)
      return {
        id,
        email: input.email || 'user@example.com',
        name: input.name || 'User Name',
        createdAt: new Date().toISOString(),
      };
      `}
    },

    deleteUser: async (_parent: any, { id }: { id: string }) => {
      ${hasDatabase ? `
      const { db } = await import('@/lib/db');
      await db.user.delete({
        where: { id },
      });

      return { success: true, message: 'User deleted successfully' };
      ` : `
      // Mock response (replace with actual database operation)
      return { success: true, message: 'User deleted successfully' };
      `}
    },
  },
};
`;
}

/**
 * Generate GraphQL API route for Next.js
 */
export function generateGraphQLApiRoute(): string {
  return `import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs, resolvers } from '@/lib/graphql/schema';

/**
 * Create Apollo Server instance
 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

/**
 * GraphQL API route handler
 */
const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
`;
}

/**
 * Generate Apollo Client setup
 */
export function generateApolloClient(config: ScaffoldConfigWithFramework): string {
  const isMonorepo = config.framework === 'monorepo';
  const apiUrl = isMonorepo
    ? "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'"
    : "''";

  return `import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc';

/**
 * Create Apollo Client for server components
 */
export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: \`\${${apiUrl}}/api/graphql\`,
      // Optional: Add headers
      // headers: {
      //   authorization: getAuthToken(),
      // },
    }),
  });
});

/**
 * Create Apollo Client for client components
 */
export function createApolloClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: \`\${${apiUrl}}/api/graphql\`,
    }),
  });
}
`;
}

/**
 * Generate Apollo Provider component
 */
export function generateApolloProvider(): string {
  return `'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { createApolloClient } from './client';

/**
 * Apollo Provider component
 */
export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const client = createApolloClient();

  return (
    <BaseApolloProvider client={client}>
      {children}
    </BaseApolloProvider>
  );
}
`;
}

/**
 * Generate GraphQL queries and mutations
 */
export function generateGraphQLQueries(): string {
  return `import { gql } from '@apollo/client';

/**
 * GraphQL queries
 */
export const GET_USERS = gql\`
  query GetUsers {
    users {
      id
      email
      name
      createdAt
    }
  }
\`;

export const GET_USER = gql\`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      createdAt
    }
  }
\`;

/**
 * GraphQL mutations
 */
export const CREATE_USER = gql\`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      name
      createdAt
    }
  }
\`;

export const UPDATE_USER = gql\`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      name
      createdAt
    }
  }
\`;

export const DELETE_USER = gql\`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
\`;
`;
}

/**
 * Generate GraphQL usage example component
 */
export function generateGraphQLUsageExample(): string {
  return `'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, CREATE_USER } from '@/lib/graphql/queries';

/**
 * Example component using GraphQL
 */
export default function UsersPage() {
  // Query example
  const { data, loading, error, refetch } = useQuery(GET_USERS);

  // Mutation example
  const [createUser, { loading: creating }] = useMutation(CREATE_USER, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleCreateUser = () => {
    createUser({
      variables: {
        input: {
          email: 'newuser@example.com',
          name: 'New User',
        },
      },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      
      <button
        onClick={handleCreateUser}
        disabled={creating}
        className="mb-4 px-4 py-2 bg-primary text-white rounded"
      >
        {creating ? 'Creating...' : 'Create User'}
      </button>

      <ul className="space-y-2">
        {data?.users?.map((user: any) => (
          <li key={user.id} className="p-4 border rounded">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;
}
