import { ScaffoldConfig } from '@/types';

/**
 * Generate NextAuth configuration file with security best practices
 */
export function generateNextAuthConfig(config: ScaffoldConfig): string {
  return `import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
${config.database === 'prisma-postgres' ? "import { PrismaAdapter } from '@auth/prisma-adapter';\nimport { prisma } from '@/lib/prisma';" : ''}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ${config.database === 'prisma-postgres' ? 'adapter: PrismaAdapter(prisma),' : ''}
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: '${config.database === 'prisma-postgres' ? 'database' : 'jwt'}',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: \`\${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token\`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async session({ session, ${config.database === 'prisma-postgres' ? 'user' : 'token'} }) {
      if (session.user) {
        ${config.database === 'prisma-postgres' ? 'session.user.id = user.id;' : 'session.user.id = token.sub!;'}
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  // Security options
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
});
`;
}

/**
 * Generate NextAuth API route
 */
export function generateNextAuthRoute(): string {
  return `import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
`;
}

/**
 * Generate NextAuth session provider wrapper
 */
export function generateNextAuthSessionProvider(): string {
  return `'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
`;
}

/**
 * Generate NextAuth sign-in page
 */
export function generateNextAuthSignInPage(config: ScaffoldConfig): string {
  return `'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center ${config.styling === 'tailwind' ? 'bg-background' : ''}">
      <div className="${config.styling === 'tailwind' ? 'w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg' : 'card'}">
        <div className="text-center">
          <h1 className="${config.styling === 'tailwind' ? 'text-3xl font-bold' : 'title'}">Sign In</h1>
          <p className="${config.styling === 'tailwind' ? 'mt-2 text-muted-foreground' : 'subtitle'}">
            Choose a provider to sign in to your account
          </p>
        </div>

        <div className="${config.styling === 'tailwind' ? 'space-y-4' : 'button-group'}">
          <button
            onClick={() => handleSignIn('github')}
            disabled={isLoading !== null}
            className="${config.styling === 'tailwind' ? 'w-full rounded-md bg-primary px-4 py-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50' : 'button button-primary'}"
          >
            {isLoading === 'github' ? 'Signing in...' : 'Sign in with GitHub'}
          </button>

          <button
            onClick={() => handleSignIn('google')}
            disabled={isLoading !== null}
            className="${config.styling === 'tailwind' ? 'w-full rounded-md border border-input bg-background px-4 py-3 hover:bg-accent hover:text-accent-foreground disabled:opacity-50' : 'button button-secondary'}"
          >
            {isLoading === 'google' ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate NextAuth error page
 */
export function generateNextAuthErrorPage(config: ScaffoldConfig): string {
  return `'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    Default: 'An error occurred during authentication.',
  };

  const message = errorMessages[error || 'Default'] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center ${config.styling === 'tailwind' ? 'bg-background' : ''}">
      <div className="${config.styling === 'tailwind' ? 'w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg text-center' : 'card'}">
        <h1 className="${config.styling === 'tailwind' ? 'text-3xl font-bold text-destructive' : 'title error'}">
          Authentication Error
        </h1>
        <p className="${config.styling === 'tailwind' ? 'text-muted-foreground' : 'text'}">
          {message}
        </p>
        <Link
          href="/auth/signin"
          className="${config.styling === 'tailwind' ? 'inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90' : 'button button-primary'}"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate Supabase client configuration
 */
export function generateSupabaseClient(): string {
  return `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
`;
}

/**
 * Generate Supabase server client (for server components)
 */
export function generateSupabaseServerClient(): string {
  return `import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The \`set\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The \`delete\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
`;
}

/**
 * Generate Supabase authentication helpers
 */
export function generateSupabaseAuthHelpers(): string {
  return `import { supabase } from './supabase-client';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: \`\${window.location.origin}/auth/reset-password\`,
  });

  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}
`;
}

/**
 * Generate Supabase database query examples
 */
export function generateSupabaseDatabaseExamples(): string {
  return `import { supabase } from './supabase-client';

/**
 * Example: Fetch all users
 */
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Example: Fetch a single user by ID
 */
export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Example: Create a new user
 */
export async function createUser(userData: {
  email: string;
  name: string;
}) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Example: Update a user
 */
export async function updateUser(id: string, updates: Partial<{
  email: string;
  name: string;
}>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Example: Delete a user
 */
export async function deleteUser(id: string) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Example: Real-time subscription
 */
export function subscribeToUsers(callback: (payload: any) => void) {
  const subscription = supabase
    .channel('users-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'users' },
      callback
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
`;
}

/**
 * Generate Supabase migration file
 */
export function generateSupabaseMigration(): string {
  return `-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table (example)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (published = true);

CREATE POLICY "Users can view their own posts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;
}

/**
 * Generate NextAuth middleware for protected routes with security headers
 */
export function generateNextAuthMiddleware(): string {
  return `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/auth/signin', '/auth/error', '/api/auth'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // If not authenticated and trying to access protected route, redirect to signin
  if (!isPublicRoute && !req.auth) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (adjust as needed for your app)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
`;
}

/**
 * Generate Clerk middleware for protected routes
 */
export function generateClerkMiddleware(): string {
  return `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  
  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
`;
}

/**
 * Generate Clerk user button component
 */
export function generateClerkUserButton(config: ScaffoldConfig): string {
  return `'use client';

import { UserButton, useUser } from '@clerk/nextjs';

export function ClerkUserProfile() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="${config.styling === 'tailwind' ? 'flex items-center gap-4' : 'user-profile'}">
      <span className="${config.styling === 'tailwind' ? 'text-sm text-muted-foreground' : 'user-name'}">
        {user.fullName || user.emailAddresses[0].emailAddress}
      </span>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
`;
}

/**
 * Generate Clerk sign-in page
 */
export function generateClerkSignInPage(): string {
  return `import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
`;
}

/**
 * Generate Clerk sign-up page
 */
export function generateClerkSignUpPage(): string {
  return `import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
`;
}

/**
 * Generate Prisma schema file
 */
export function generatePrismaSchema(config: ScaffoldConfig): string {
  const hasNextAuth = config.auth === 'nextauth';

  return `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

${
  hasNextAuth
    ? `// NextAuth.js models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

`
    : ''
}model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
${
  hasNextAuth
    ? `  accounts      Account[]
  sessions      Session[]
`
    : ''
}  posts         Post[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?  @db.Text
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
  @@index([published])
}
`;
}

/**
 * Generate Prisma client initialization
 */
export function generatePrismaClient(): string {
  return `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`;
}

/**
 * Generate Prisma query examples
 */
export function generatePrismaExamples(): string {
  return `import { prisma } from './prisma';

/**
 * Example: Get all users
 */
export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Example: Get user by ID with posts
 */
export async function getUserWithPosts(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

/**
 * Example: Create a new user
 */
export async function createUser(data: {
  email: string;
  name?: string;
}) {
  return await prisma.user.create({
    data,
  });
}

/**
 * Example: Update user
 */
export async function updateUser(userId: string, data: {
  name?: string;
  email?: string;
}) {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
}

/**
 * Example: Delete user
 */
export async function deleteUser(userId: string) {
  return await prisma.user.delete({
    where: { id: userId },
  });
}

/**
 * Example: Create a post
 */
export async function createPost(data: {
  title: string;
  content?: string;
  authorId: string;
}) {
  return await prisma.post.create({
    data,
  });
}

/**
 * Example: Get published posts
 */
export async function getPublishedPosts() {
  return await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Example: Update post
 */
export async function updatePost(postId: string, data: {
  title?: string;
  content?: string;
  published?: boolean;
}) {
  return await prisma.post.update({
    where: { id: postId },
    data,
  });
}

/**
 * Example: Delete post
 */
export async function deletePost(postId: string) {
  return await prisma.post.delete({
    where: { id: postId },
  });
}

/**
 * Example: Transaction - Create user with post
 */
export async function createUserWithPost(userData: {
  email: string;
  name?: string;
}, postData: {
  title: string;
  content?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: userData,
    });

    const post = await tx.post.create({
      data: {
        ...postData,
        authorId: user.id,
      },
    });

    return { user, post };
  });
}
`;
}

/**
 * Generate Prisma migration script
 */
export function generatePrismaMigrationScript(): string {
  return `#!/bin/bash
set -e

echo "Running Prisma migrations..."

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

echo "Migrations completed successfully!"
`;
}

/**
 * Generate Drizzle schema definitions
 */
export function generateDrizzleSchema(config: ScaffoldConfig): string {
  const hasNextAuth = config.auth === 'nextauth';

  return `import { pgTable, text, timestamp, boolean, integer, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

${
  hasNextAuth
    ? `// NextAuth.js tables
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

`
    : ''
}export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false).notNull(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
${hasNextAuth ? '  accounts: many(accounts),\n  sessions: many(sessions),' : ''}
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

${
  hasNextAuth
    ? `export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
`
    : ''
}`;
}

/**
 * Generate Drizzle database connection setup
 */
export function generateDrizzleClient(): string {
  return `import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
`;
}

/**
 * Generate Drizzle query examples
 */
export function generateDrizzleExamples(): string {
  return `import { db } from './db';
import { users, posts } from './schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Example: Get all users
 */
export async function getUsers() {
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

/**
 * Example: Get user by ID with posts
 */
export async function getUserWithPosts(userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      posts: {
        orderBy: desc(posts.createdAt),
      },
    },
  });
}

/**
 * Example: Create a new user
 */
export async function createUser(data: {
  email: string;
  name?: string;
}) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

/**
 * Example: Update user
 */
export async function updateUser(userId: string, data: {
  name?: string;
  email?: string;
}) {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return user;
}

/**
 * Example: Delete user
 */
export async function deleteUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}

/**
 * Example: Create a post
 */
export async function createPost(data: {
  title: string;
  content?: string;
  authorId: string;
}) {
  const [post] = await db.insert(posts).values(data).returning();
  return post;
}

/**
 * Example: Get published posts
 */
export async function getPublishedPosts() {
  return await db.query.posts.findMany({
    where: eq(posts.published, true),
    with: {
      author: {
        columns: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: desc(posts.createdAt),
  });
}

/**
 * Example: Update post
 */
export async function updatePost(postId: string, data: {
  title?: string;
  content?: string;
  published?: boolean;
}) {
  const [post] = await db
    .update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, postId))
    .returning();
  return post;
}

/**
 * Example: Delete post
 */
export async function deletePost(postId: string) {
  await db.delete(posts).where(eq(posts.id, postId));
}

/**
 * Example: Transaction - Create user with post
 */
export async function createUserWithPost(userData: {
  email: string;
  name?: string;
}, postData: {
  title: string;
  content?: string;
}) {
  return await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values(userData).returning();
    const [post] = await tx.insert(posts).values({
      ...postData,
      authorId: user.id,
    }).returning();

    return { user, post };
  });
}
`;
}

/**
 * Generate Drizzle configuration file
 */
export function generateDrizzleConfig(): string {
  return `import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
`;
}

/**
 * Generate Drizzle migration script
 */
export function generateDrizzleMigrationScript(): string {
  return `#!/bin/bash
set -e

echo "Running Drizzle migrations..."

# Generate migrations
npx drizzle-kit generate

# Run migrations
npx drizzle-kit migrate

echo "Migrations completed successfully!"
`;
}


/**
 * Generate Redis client setup
 */
export function generateRedisClient(): string {
  return `import Redis from 'ioredis';

// Create Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true;
    }
    return false;
  },
});

redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('error', (err) => {
  console.error('Redis client error:', err);
});

export { redis };
`;
}

/**
 * Generate Redis caching helper functions
 */
export function generateRedisCacheHelpers(): string {
  return `import { redis } from './redis-client';

/**
 * Cache helper functions for common caching patterns
 */

/**
 * Get a value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
}

/**
 * Set a value in cache with optional TTL (in seconds)
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl?: number
): Promise<boolean> {
  try {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error('Error setting cache:', error);
    return false;
  }
}

/**
 * Delete a value from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting cache:', error);
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  } catch (error) {
    console.error('Error deleting cache pattern:', error);
    return 0;
  }
}

/**
 * Check if a key exists in cache
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Error checking cache:', error);
    return false;
  }
}

/**
 * Get or set pattern: Get from cache, or compute and cache if not found
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, fetch the data
  const data = await fetcher();

  // Store in cache for next time
  await setCache(key, data, ttl);

  return data;
}

/**
 * Increment a counter in cache
 */
export async function incrementCache(
  key: string,
  amount: number = 1
): Promise<number> {
  try {
    return await redis.incrby(key, amount);
  } catch (error) {
    console.error('Error incrementing cache:', error);
    return 0;
  }
}

/**
 * Set expiration time for a key (in seconds)
 */
export async function expireCache(key: string, ttl: number): Promise<boolean> {
  try {
    const result = await redis.expire(key, ttl);
    return result === 1;
  } catch (error) {
    console.error('Error setting expiration:', error);
    return false;
  }
}

/**
 * Get time to live for a key (in seconds)
 */
export async function getTTL(key: string): Promise<number> {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error('Error getting TTL:', error);
    return -1;
  }
}
`;
}

/**
 * Generate Redis usage examples
 */
export function generateRedisExamples(): string {
  return `import {
  getCache,
  setCache,
  deleteCache,
  getOrSet,
  incrementCache,
} from './cache-helpers';

/**
 * Example: Caching user data
 */
export async function getCachedUser(userId: string) {
  const cacheKey = \`user:\${userId}\`;
  
  return await getOrSet(
    cacheKey,
    async () => {
      // Fetch from database
      const user = await fetchUserFromDatabase(userId);
      return user;
    },
    3600 // Cache for 1 hour
  );
}

/**
 * Example: Rate limiting
 */
export async function checkRateLimit(
  userId: string,
  limit: number = 100,
  window: number = 3600
): Promise<{ allowed: boolean; remaining: number }> {
  const key = \`rate_limit:\${userId}\`;
  const current = await incrementCache(key);
  
  if (current === 1) {
    // First request, set expiration
    await expireCache(key, window);
  }
  
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
  };
}

/**
 * Example: Session storage
 */
export async function storeSession(
  sessionId: string,
  data: any,
  ttl: number = 86400 // 24 hours
) {
  const key = \`session:\${sessionId}\`;
  await setCache(key, data, ttl);
}

export async function getSession(sessionId: string) {
  const key = \`session:\${sessionId}\`;
  return await getCache(key);
}

export async function deleteSession(sessionId: string) {
  const key = \`session:\${sessionId}\`;
  await deleteCache(key);
}

/**
 * Example: Caching API responses
 */
export async function getCachedApiResponse(endpoint: string) {
  const cacheKey = \`api:\${endpoint}\`;
  
  return await getOrSet(
    cacheKey,
    async () => {
      const response = await fetch(endpoint);
      return await response.json();
    },
    300 // Cache for 5 minutes
  );
}

// Placeholder for database fetch
async function fetchUserFromDatabase(userId: string) {
  // This would be your actual database query
  return { id: userId, name: 'Example User' };
}
`;
}
