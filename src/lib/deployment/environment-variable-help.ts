/**
 * Environment Variable Help System
 * 
 * Provides detailed help information for environment variables including:
 * - Purpose and usage
 * - Where to get values
 * - Consequences of missing optional variables
 * - Links to service documentation
 * 
 * Requirements 11.3, 11.4: Add tooltips and explain purpose
 */

export interface EnvVarHelpInfo {
  key: string;
  purpose: string;
  whereToGet: string;
  howToGet: string[];
  consequences?: string;
  documentationLinks: {
    text: string;
    url: string;
  }[];
  example?: string;
  tips?: string[];
}

export const ENV_VAR_HELP: Record<string, EnvVarHelpInfo> = {
  // Database Variables
  DATABASE_URL: {
    key: 'DATABASE_URL',
    purpose:
      'Connection string for your PostgreSQL database. Required for all database operations including user authentication, data storage, and queries.',
    whereToGet: 'From your database provider (Supabase, Neon, Railway, etc.)',
    howToGet: [
      'Sign up for a database provider (Supabase, Neon, Railway, or Render)',
      'Create a new PostgreSQL database',
      'Copy the connection string from your dashboard',
      'Paste it here (it will be encrypted)',
    ],
    consequences:
      'Without DATABASE_URL, your application cannot store or retrieve data. Authentication, user profiles, and all database features will not work.',
    documentationLinks: [
      {
        text: 'Supabase Database Setup',
        url: 'https://supabase.com/docs/guides/database',
      },
      {
        text: 'Neon PostgreSQL',
        url: 'https://neon.tech/docs/introduction',
      },
      {
        text: 'Railway Database',
        url: 'https://docs.railway.app/databases/postgresql',
      },
    ],
    example: 'postgresql://user:password@host.region.provider.com:5432/dbname',
    tips: [
      'Use connection pooling for better performance',
      'Keep your database in the same region as your app for lower latency',
      'Enable SSL mode for secure connections',
    ],
  },

  // NextAuth Variables
  NEXTAUTH_SECRET: {
    key: 'NEXTAUTH_SECRET',
    purpose:
      'Secret key used by NextAuth.js to encrypt session tokens and cookies. This ensures your authentication system is secure.',
    whereToGet: 'Generate a random secret string',
    howToGet: [
      'Run: openssl rand -base64 32',
      'Or visit: https://generate-secret.vercel.app/32',
      'Copy the generated secret',
      'Paste it here',
    ],
    consequences:
      'Without NEXTAUTH_SECRET, NextAuth.js cannot encrypt sessions. Users will not be able to log in or maintain authenticated sessions.',
    documentationLinks: [
      {
        text: 'NextAuth.js Configuration',
        url: 'https://next-auth.js.org/configuration/options#secret',
      },
      {
        text: 'Generate Secret Online',
        url: 'https://generate-secret.vercel.app/32',
      },
    ],
    tips: [
      'Use at least 32 characters for security',
      'Never commit this to version control',
      'Use different secrets for development and production',
    ],
  },

  NEXTAUTH_URL: {
    key: 'NEXTAUTH_URL',
    purpose:
      'The canonical URL of your application. NextAuth.js uses this for OAuth callbacks and redirects.',
    whereToGet: 'Your deployment URL (provided after deployment)',
    howToGet: [
      'After deployment, copy your application URL',
      'Update this environment variable with the URL',
      'Include the protocol (https://)',
    ],
    consequences:
      'OAuth providers will not be able to redirect users back to your app after authentication. Social login will not work.',
    documentationLinks: [
      {
        text: 'NextAuth.js URL Configuration',
        url: 'https://next-auth.js.org/configuration/options#nextauth_url',
      },
    ],
    example: 'https://your-app.vercel.app',
    tips: [
      'Update this after deployment with your actual URL',
      'Use HTTPS in production',
      'Update OAuth provider callback URLs to match',
    ],
  },

  // Clerk Variables
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
    key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    purpose:
      'Public key for Clerk authentication. This is safe to expose in client-side code and enables Clerk components to work.',
    whereToGet: 'From your Clerk dashboard',
    howToGet: [
      'Sign up at https://clerk.com',
      'Create a new application',
      'Go to API Keys section',
      'Copy the Publishable Key',
    ],
    consequences:
      'Clerk authentication components will not initialize. Users cannot sign up or log in.',
    documentationLinks: [
      {
        text: 'Clerk Dashboard',
        url: 'https://dashboard.clerk.com',
      },
      {
        text: 'Clerk Setup Guide',
        url: 'https://clerk.com/docs/quickstarts/nextjs',
      },
    ],
    example: 'pk_test_...',
  },

  CLERK_SECRET_KEY: {
    key: 'CLERK_SECRET_KEY',
    purpose:
      'Secret key for Clerk authentication. Used for server-side operations and API calls. Keep this secure.',
    whereToGet: 'From your Clerk dashboard',
    howToGet: [
      'Go to your Clerk dashboard',
      'Navigate to API Keys',
      'Copy the Secret Key',
      'Paste it here (it will be encrypted)',
    ],
    consequences:
      'Server-side authentication checks will fail. Protected API routes and middleware will not work.',
    documentationLinks: [
      {
        text: 'Clerk API Keys',
        url: 'https://clerk.com/docs/references/backend/overview',
      },
    ],
    example: 'sk_test_...',
    tips: [
      'Never expose this in client-side code',
      'Rotate keys if compromised',
      'Use different keys for development and production',
    ],
  },

  // Supabase Variables
  NEXT_PUBLIC_SUPABASE_URL: {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    purpose:
      'Your Supabase project URL. Used to connect to Supabase services including database, authentication, and storage.',
    whereToGet: 'From your Supabase project dashboard',
    howToGet: [
      'Sign up at https://supabase.com',
      'Create a new project',
      'Go to Settings > API',
      'Copy the Project URL',
    ],
    consequences:
      'Cannot connect to Supabase services. Database, authentication, and storage features will not work.',
    documentationLinks: [
      {
        text: 'Supabase Dashboard',
        url: 'https://app.supabase.com',
      },
      {
        text: 'Supabase Setup',
        url: 'https://supabase.com/docs/guides/getting-started',
      },
    ],
    example: 'https://xxxxx.supabase.co',
  },

  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    purpose:
      'Public anonymous key for Supabase. Safe to use in client-side code. Provides access based on your Row Level Security policies.',
    whereToGet: 'From your Supabase project dashboard',
    howToGet: [
      'Go to your Supabase project',
      'Navigate to Settings > API',
      'Copy the anon/public key',
    ],
    consequences:
      'Client-side Supabase operations will fail. Users cannot interact with your database or authentication.',
    documentationLinks: [
      {
        text: 'Supabase API Keys',
        url: 'https://supabase.com/docs/guides/api#api-url-and-keys',
      },
    ],
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },

  // AI Provider Variables
  ANTHROPIC_API_KEY: {
    key: 'ANTHROPIC_API_KEY',
    purpose:
      'API key for Anthropic Claude AI. Required for AI-powered features like chat, content generation, and analysis.',
    whereToGet: 'From Anthropic Console',
    howToGet: [
      'Sign up at https://console.anthropic.com',
      'Go to API Keys section',
      'Create a new API key',
      'Copy and paste it here',
    ],
    consequences:
      'AI features will not work. Chat, content generation, and AI-powered functionality will be disabled.',
    documentationLinks: [
      {
        text: 'Anthropic Console',
        url: 'https://console.anthropic.com/settings/keys',
      },
      {
        text: 'Anthropic API Docs',
        url: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
      },
      {
        text: 'Pricing Information',
        url: 'https://www.anthropic.com/pricing',
      },
    ],
    example: 'sk-ant-api03-...',
    tips: [
      'Monitor your usage to avoid unexpected costs',
      'Set up usage limits in the Anthropic Console',
      'Use different keys for development and production',
    ],
  },

  OPENAI_API_KEY: {
    key: 'OPENAI_API_KEY',
    purpose:
      'API key for OpenAI services. Required for GPT models, embeddings, and other OpenAI features.',
    whereToGet: 'From OpenAI Platform',
    howToGet: [
      'Sign up at https://platform.openai.com',
      'Go to API Keys section',
      'Create a new secret key',
      'Copy and paste it here',
    ],
    consequences:
      'OpenAI-powered features will not work. GPT chat, embeddings, and AI functionality will be disabled.',
    documentationLinks: [
      {
        text: 'OpenAI API Keys',
        url: 'https://platform.openai.com/api-keys',
      },
      {
        text: 'OpenAI Documentation',
        url: 'https://platform.openai.com/docs/introduction',
      },
      {
        text: 'Usage and Billing',
        url: 'https://platform.openai.com/account/usage',
      },
    ],
    example: 'sk-...',
    tips: [
      'Set usage limits to control costs',
      'Monitor your usage regularly',
      'Use different keys for different environments',
    ],
  },

  // Redis Variables
  REDIS_URL: {
    key: 'REDIS_URL',
    purpose:
      'Connection URL for Redis. Used for caching, session storage, rate limiting, and real-time features.',
    whereToGet: 'From your Redis provider (Upstash, Redis Cloud, etc.)',
    howToGet: [
      'Sign up for a Redis provider (Upstash recommended)',
      'Create a new Redis database',
      'Copy the connection URL',
      'Paste it here',
    ],
    consequences:
      'Caching and rate limiting will be disabled. Application may be slower and less efficient. Real-time features may not work.',
    documentationLinks: [
      {
        text: 'Upstash Redis',
        url: 'https://upstash.com/docs/redis/overall/getstarted',
      },
      {
        text: 'Redis Cloud',
        url: 'https://redis.com/redis-enterprise-cloud/overview/',
      },
    ],
    example: 'redis://default:password@host:port',
    tips: [
      'Upstash offers a generous free tier',
      'Use TLS for secure connections',
      'Consider using connection pooling',
    ],
  },

  // Stripe Variables
  STRIPE_SECRET_KEY: {
    key: 'STRIPE_SECRET_KEY',
    purpose:
      'Secret key for Stripe payment processing. Used for server-side payment operations and API calls.',
    whereToGet: 'From your Stripe dashboard',
    howToGet: [
      'Sign up at https://stripe.com',
      'Go to Developers > API Keys',
      'Copy the Secret Key',
      'Use test key for development',
    ],
    consequences:
      'Payment processing will not work. Users cannot make purchases or subscriptions.',
    documentationLinks: [
      {
        text: 'Stripe Dashboard',
        url: 'https://dashboard.stripe.com/apikeys',
      },
      {
        text: 'Stripe API Docs',
        url: 'https://stripe.com/docs/api',
      },
    ],
    example: 'sk_test_... or sk_live_...',
    tips: [
      'Use test keys during development',
      'Never commit secret keys to version control',
      'Enable webhook signing for security',
    ],
  },

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    purpose:
      'Public key for Stripe. Safe to use in client-side code. Used to initialize Stripe.js and create payment elements.',
    whereToGet: 'From your Stripe dashboard',
    howToGet: [
      'Go to Stripe Dashboard',
      'Navigate to Developers > API Keys',
      'Copy the Publishable Key',
    ],
    consequences:
      'Stripe payment forms will not initialize. Users cannot enter payment information.',
    documentationLinks: [
      {
        text: 'Stripe Keys',
        url: 'https://stripe.com/docs/keys',
      },
    ],
    example: 'pk_test_... or pk_live_...',
  },
};

/**
 * Get help information for an environment variable
 */
export function getEnvVarHelp(key: string): EnvVarHelpInfo | undefined {
  return ENV_VAR_HELP[key];
}

/**
 * Get all help information
 */
export function getAllEnvVarHelp(): Record<string, EnvVarHelpInfo> {
  return ENV_VAR_HELP;
}
