import { ScaffoldConfig } from '@/types';

/**
 * Represents an environment variable with metadata for deployment configuration
 */
export interface EnvironmentVariable {
  key: string;
  value: string;
  description: string;
  required: boolean;
  sensitive: boolean;
  example?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

/**
 * Detects and generates required environment variables based on scaffold configuration
 */
export class EnvironmentVariableDetector {
  /**
   * Detect all required environment variables for a given scaffold configuration
   */
  detect(config: ScaffoldConfig): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];

    // Database variables
    vars.push(...this.detectDatabaseVariables(config));

    // Authentication variables
    vars.push(...this.detectAuthVariables(config));

    // AI template variables
    vars.push(...this.detectAIVariables(config));

    // Redis and other service variables
    vars.push(...this.detectServiceVariables(config));

    return vars;
  }

  /**
   * Detect database-related environment variables
   */
  private detectDatabaseVariables(config: ScaffoldConfig): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];

    if (config.database === 'none') {
      return vars;
    }

    // PostgreSQL databases (Prisma and Drizzle)
    if (
      config.database === 'prisma-postgres' ||
      config.database === 'drizzle-postgres'
    ) {
      vars.push({
        key: 'DATABASE_URL',
        value: '',
        description: 'PostgreSQL connection string for database access',
        required: true,
        sensitive: true,
        example: 'postgresql://user:password@host:5432/dbname',
        validation: {
          pattern: '^postgresql://.+',
        },
      });
    }

    // MongoDB
    if (config.database === 'mongodb') {
      vars.push({
        key: 'MONGODB_URI',
        value: '',
        description: 'MongoDB connection string',
        required: true,
        sensitive: true,
        example: 'mongodb+srv://user:password@cluster.mongodb.net/dbname',
        validation: {
          pattern: '^mongodb(\\+srv)?://.+',
        },
      });
    }

    // Supabase
    if (config.database === 'supabase') {
      vars.push(
        {
          key: 'NEXT_PUBLIC_SUPABASE_URL',
          value: '',
          description: 'Supabase project URL',
          required: true,
          sensitive: false,
          example: 'https://xxxxx.supabase.co',
          validation: {
            pattern: '^https://.+\\.supabase\\.co$',
          },
        },
        {
          key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          value: '',
          description: 'Supabase anonymous/public key',
          required: true,
          sensitive: false,
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          validation: {
            pattern: '^eyJ[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+$',
          },
        },
        {
          key: 'SUPABASE_SERVICE_ROLE_KEY',
          value: '',
          description: 'Supabase service role key (for server-side operations)',
          required: false,
          sensitive: true,
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        }
      );
    }

    return vars;
  }

  /**
   * Detect authentication-related environment variables
   */
  private detectAuthVariables(config: ScaffoldConfig): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];

    if (config.auth === 'none') {
      return vars;
    }

    // NextAuth.js
    if (config.auth === 'nextauth') {
      vars.push(
        {
          key: 'NEXTAUTH_SECRET',
          value: '',
          description:
            'Secret key for NextAuth.js session encryption (generate with: openssl rand -base64 32)',
          required: true,
          sensitive: true,
          example: 'your-secret-key-min-32-characters',
          validation: {
            minLength: 32,
          },
        },
        {
          key: 'NEXTAUTH_URL',
          value: '',
          description: 'Canonical URL of your site (will be auto-set on deployment)',
          required: true,
          sensitive: false,
          example: 'https://your-app.vercel.app',
          validation: {
            pattern: '^https?://.+',
          },
        },
        {
          key: 'GITHUB_ID',
          value: '',
          description: 'GitHub OAuth App Client ID',
          required: false,
          sensitive: false,
          example: 'Iv1.1234567890abcdef',
        },
        {
          key: 'GITHUB_SECRET',
          value: '',
          description: 'GitHub OAuth App Client Secret',
          required: false,
          sensitive: true,
          example: 'abcdef1234567890abcdef1234567890abcdef12',
          validation: {
            minLength: 40,
          },
        },
        {
          key: 'GOOGLE_CLIENT_ID',
          value: '',
          description: 'Google OAuth Client ID',
          required: false,
          sensitive: false,
          example: '123456789012-abcdefghijklmnop.apps.googleusercontent.com',
        },
        {
          key: 'GOOGLE_CLIENT_SECRET',
          value: '',
          description: 'Google OAuth Client Secret',
          required: false,
          sensitive: true,
          example: 'GOCSPX-abcdefghijklmnopqrstuvwx',
        }
      );
    }

    // Clerk
    if (config.auth === 'clerk') {
      vars.push(
        {
          key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
          value: '',
          description: 'Clerk publishable key (safe to expose in browser)',
          required: true,
          sensitive: false,
          example: 'pk_test_abcdefghijklmnopqrstuvwxyz',
          validation: {
            pattern: '^pk_(test|live)_.+',
          },
        },
        {
          key: 'CLERK_SECRET_KEY',
          value: '',
          description: 'Clerk secret key (keep secure, server-side only)',
          required: true,
          sensitive: true,
          example: 'sk_test_abcdefghijklmnopqrstuvwxyz',
          validation: {
            pattern: '^sk_(test|live)_.+',
          },
        }
      );
    }

    // Supabase Auth (if using Supabase for auth)
    if (config.auth === 'supabase') {
      // Supabase auth uses the same keys as database
      // Already added in detectDatabaseVariables if database is supabase
      // Add them here if database is not supabase but auth is
      if (config.database !== 'supabase') {
        vars.push(
          {
            key: 'NEXT_PUBLIC_SUPABASE_URL',
            value: '',
            description: 'Supabase project URL',
            required: true,
            sensitive: false,
            example: 'https://xxxxx.supabase.co',
            validation: {
              pattern: '^https://.+\\.supabase\\.co$',
            },
          },
          {
            key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            value: '',
            description: 'Supabase anonymous/public key',
            required: true,
            sensitive: false,
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            validation: {
              pattern: '^eyJ[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+$',
            },
          }
        );
      }
    }

    return vars;
  }

  /**
   * Detect AI template-related environment variables
   */
  private detectAIVariables(config: ScaffoldConfig): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];

    if (!config.aiTemplate || config.aiTemplate === 'none') {
      return vars;
    }

    // Anthropic (Claude)
    if (config.aiProvider === 'anthropic') {
      vars.push({
        key: 'ANTHROPIC_API_KEY',
        value: '',
        description: 'Anthropic API key for Claude AI features',
        required: true,
        sensitive: true,
        example: 'sk-ant-api03-...',
        validation: {
          pattern: '^sk-ant-',
        },
      });
    }

    // OpenAI
    if (config.aiProvider === 'openai') {
      vars.push({
        key: 'OPENAI_API_KEY',
        value: '',
        description: 'OpenAI API key for GPT features',
        required: true,
        sensitive: true,
        example: 'sk-...',
        validation: {
          pattern: '^sk-',
          minLength: 20,
        },
      });
    }

    // AWS Bedrock
    if (config.aiProvider === 'aws-bedrock') {
      vars.push(
        {
          key: 'AWS_ACCESS_KEY_ID',
          value: '',
          description: 'AWS access key ID for Bedrock',
          required: true,
          sensitive: true,
          example: 'AKIAIOSFODNN7EXAMPLE',
          validation: {
            pattern: '^AKIA[0-9A-Z]{16}$',
          },
        },
        {
          key: 'AWS_SECRET_ACCESS_KEY',
          value: '',
          description: 'AWS secret access key for Bedrock',
          required: true,
          sensitive: true,
          example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
          validation: {
            minLength: 40,
          },
        },
        {
          key: 'AWS_REGION',
          value: '',
          description: 'AWS region for Bedrock service',
          required: true,
          sensitive: false,
          example: 'us-east-1',
          validation: {
            pattern: '^[a-z]{2}-[a-z]+-\\d{1}$',
          },
        }
      );
    }

    // Google Gemini
    if (config.aiProvider === 'gemini') {
      vars.push({
        key: 'GOOGLE_AI_API_KEY',
        value: '',
        description: 'Google AI API key for Gemini features',
        required: true,
        sensitive: true,
        example: 'AIzaSy...',
        validation: {
          pattern: '^AIzaSy',
        },
      });
    }

    return vars;
  }

  /**
   * Detect service-related environment variables (Redis, etc.)
   */
  private detectServiceVariables(config: ScaffoldConfig): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];

    // Redis
    if (config.extras.redis) {
      vars.push({
        key: 'REDIS_URL',
        value: '',
        description: 'Redis connection URL for caching and sessions',
        required: false,
        sensitive: true,
        example: 'redis://default:password@host:6379',
        validation: {
          pattern: '^redis(s)?://.+',
        },
      });
    }

    // General application URL (useful for callbacks, webhooks, etc.)
    vars.push({
      key: 'NEXT_PUBLIC_APP_URL',
      value: '',
      description: 'Public URL of your application (auto-set on deployment)',
      required: false,
      sensitive: false,
      example: 'https://your-app.vercel.app',
      validation: {
        pattern: '^https?://.+',
      },
    });

    return vars;
  }
}
