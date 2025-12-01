import { ScaffoldConfig } from '@/types';
import {
  DeploymentRequirements,
  EnvironmentVariable,
} from '@/types/deployment-guides';

/**
 * ConfigurationAnalyzer
 * 
 * Analyzes scaffold configuration to determine deployment requirements.
 * Detects database, authentication, AI templates, monorepo structure,
 * and generates environment variable requirements.
 */
export class ConfigurationAnalyzer {
  /**
   * Analyze scaffold configuration and return deployment requirements
   */
  analyze(config: ScaffoldConfig): DeploymentRequirements {
    return {
      requiresDatabase: this.detectDatabase(config),
      databaseType: this.getDatabaseType(config.database),
      requiresAuth: this.detectAuth(config),
      authProvider: this.getAuthProvider(config.auth),
      requiresAI: this.detectAI(config),
      requiresRedis: config.extras.redis,
      isMonorepo: this.detectMonorepo(config),
      framework: this.getFramework(config),
      buildTool: config.buildTool,
      environmentVariables: this.detectEnvironmentVariables(config),
    };
  }

  /**
   * Detect if database is required
   */
  private detectDatabase(config: ScaffoldConfig): boolean {
    return config.database !== 'none';
  }

  /**
   * Get human-readable database type
   */
  private getDatabaseType(database: string): string | undefined {
    if (database === 'none') return undefined;
    
    if (database.includes('postgres')) return 'PostgreSQL';
    if (database.includes('mysql')) return 'MySQL';
    if (database.includes('mongodb')) return 'MongoDB';
    if (database === 'supabase') return 'PostgreSQL (Supabase)';
    
    return 'Database';
  }

  /**
   * Detect if authentication is required
   */
  private detectAuth(config: ScaffoldConfig): boolean {
    return config.auth !== 'none';
  }

  /**
   * Get authentication provider name
   */
  private getAuthProvider(auth: string): string | undefined {
    if (auth === 'none') return undefined;
    
    const providers: Record<string, string> = {
      nextauth: 'NextAuth.js',
      clerk: 'Clerk',
      supabase: 'Supabase Auth',
    };
    
    return providers[auth] || auth;
  }

  /**
   * Detect if AI features are required
   */
  private detectAI(config: ScaffoldConfig): boolean {
    return config.aiTemplates !== undefined && config.aiTemplates.length > 0;
  }

  /**
   * Detect if project is a monorepo
   */
  private detectMonorepo(config: ScaffoldConfig): boolean {
    return config.projectStructure === 'fullstack-monorepo';
  }

  /**
   * Get framework name for display
   */
  private getFramework(config: ScaffoldConfig): string {
    const frameworks: Record<string, string> = {
      nextjs: 'Next.js',
      react: 'React',
      vue: 'Vue',
      angular: 'Angular',
      svelte: 'Svelte',
    };
    
    return frameworks[config.frontendFramework] || config.frontendFramework;
  }

  /**
   * Detect all required environment variables based on configuration
   */
  detectEnvironmentVariables(config: ScaffoldConfig): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];

    // Database environment variables
    if (config.database !== 'none') {
      vars.push(...this.getDatabaseEnvVars(config.database));
    }

    // Authentication environment variables
    if (config.auth !== 'none') {
      vars.push(...this.getAuthEnvVars(config.auth));
    }

    // AI environment variables
    if (config.aiTemplates && config.aiTemplates.length > 0) {
      vars.push(...this.getAIEnvVars(config.aiProvider));
    }

    // Redis environment variables
    if (config.extras.redis) {
      vars.push(...this.getRedisEnvVars());
    }

    return vars;
  }

  /**
   * Get database-specific environment variables
   */
  private getDatabaseEnvVars(database: string): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];

    if (database === 'supabase') {
      vars.push(
        {
          key: 'NEXT_PUBLIC_SUPABASE_URL',
          description: 'Supabase project URL',
          required: true,
          example: 'https://xxxxx.supabase.co',
          howToGet: 'Get from your Supabase project settings',
          link: 'https://app.supabase.com',
        },
        {
          key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          description: 'Supabase anonymous key',
          required: true,
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          howToGet: 'Get from your Supabase project settings',
          link: 'https://app.supabase.com',
        },
        {
          key: 'SUPABASE_SERVICE_ROLE_KEY',
          description: 'Supabase service role key (for server-side operations)',
          required: false,
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          howToGet: 'Get from your Supabase project settings (keep this secret!)',
          link: 'https://app.supabase.com',
        }
      );
    } else if (database.includes('postgres')) {
      vars.push({
        key: 'DATABASE_URL',
        description: 'PostgreSQL connection string',
        required: true,
        example: 'postgresql://user:password@host:5432/dbname',
        howToGet:
          'Create a PostgreSQL database on your platform or use a service like Supabase, Railway, or Neon',
        link: 'https://supabase.com',
      });
    } else if (database === 'mongodb') {
      vars.push({
        key: 'MONGODB_URI',
        description: 'MongoDB connection string',
        required: true,
        example: 'mongodb+srv://user:password@cluster.mongodb.net/dbname',
        howToGet: 'Create a MongoDB database on MongoDB Atlas',
        link: 'https://www.mongodb.com/cloud/atlas',
      });
    }

    return vars;
  }

  /**
   * Get authentication-specific environment variables
   */
  private getAuthEnvVars(auth: string): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];

    if (auth === 'nextauth') {
      vars.push(
        {
          key: 'NEXTAUTH_SECRET',
          description: 'Secret for NextAuth.js session encryption',
          required: true,
          example: 'generated-secret-key-here',
          howToGet: 'Generate with: openssl rand -base64 32',
        },
        {
          key: 'NEXTAUTH_URL',
          description: 'Canonical URL of your site',
          required: true,
          example: 'https://your-app.vercel.app',
          howToGet: 'Use your deployment URL (will be provided after first deploy)',
        },
        {
          key: 'GITHUB_ID',
          description: 'GitHub OAuth App Client ID',
          required: false,
          example: 'Iv1.1234567890abcdef',
          howToGet: 'Create a GitHub OAuth App',
          link: 'https://github.com/settings/developers',
        },
        {
          key: 'GITHUB_SECRET',
          description: 'GitHub OAuth App Client Secret',
          required: false,
          example: 'abcdef1234567890abcdef1234567890abcdef12',
          howToGet: 'Create a GitHub OAuth App',
          link: 'https://github.com/settings/developers',
        },
        {
          key: 'GOOGLE_CLIENT_ID',
          description: 'Google OAuth Client ID',
          required: false,
          example: '123456789-abcdefghijklmnop.apps.googleusercontent.com',
          howToGet: 'Create OAuth credentials in Google Cloud Console',
          link: 'https://console.cloud.google.com/apis/credentials',
        },
        {
          key: 'GOOGLE_CLIENT_SECRET',
          description: 'Google OAuth Client Secret',
          required: false,
          example: 'GOCSPX-abcdefghijklmnop',
          howToGet: 'Create OAuth credentials in Google Cloud Console',
          link: 'https://console.cloud.google.com/apis/credentials',
        }
      );
    } else if (auth === 'clerk') {
      vars.push(
        {
          key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
          description: 'Clerk publishable key',
          required: true,
          example: 'pk_test_abcdefghijklmnop',
          howToGet: 'Get from Clerk dashboard',
          link: 'https://dashboard.clerk.com',
        },
        {
          key: 'CLERK_SECRET_KEY',
          description: 'Clerk secret key',
          required: true,
          example: 'sk_test_abcdefghijklmnop',
          howToGet: 'Get from Clerk dashboard',
          link: 'https://dashboard.clerk.com',
        }
      );
    } else if (auth === 'supabase') {
      // Supabase auth uses the same keys as Supabase database
      // These are already added in getDatabaseEnvVars if database is supabase
      // Only add if database is not supabase
      vars.push(
        {
          key: 'NEXT_PUBLIC_SUPABASE_URL',
          description: 'Supabase project URL',
          required: true,
          example: 'https://xxxxx.supabase.co',
          howToGet: 'Get from your Supabase project settings',
          link: 'https://app.supabase.com',
        },
        {
          key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          description: 'Supabase anonymous key',
          required: true,
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          howToGet: 'Get from your Supabase project settings',
          link: 'https://app.supabase.com',
        }
      );
    }

    return vars;
  }

  /**
   * Get AI-specific environment variables
   */
  private getAIEnvVars(aiProvider?: string): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];

    if (!aiProvider || aiProvider === 'anthropic') {
      vars.push({
        key: 'ANTHROPIC_API_KEY',
        description: 'Anthropic API key for Claude AI',
        required: true,
        example: 'sk-ant-api03-...',
        howToGet: 'Get from Anthropic Console',
        link: 'https://console.anthropic.com/settings/keys',
      });
    }

    if (aiProvider === 'openai') {
      vars.push({
        key: 'OPENAI_API_KEY',
        description: 'OpenAI API key',
        required: true,
        example: 'sk-...',
        howToGet: 'Get from OpenAI Platform',
        link: 'https://platform.openai.com/api-keys',
      });
    }

    if (aiProvider === 'aws-bedrock') {
      vars.push(
        {
          key: 'AWS_ACCESS_KEY_ID',
          description: 'AWS access key ID',
          required: true,
          example: 'AKIAIOSFODNN7EXAMPLE',
          howToGet: 'Create IAM user in AWS Console',
          link: 'https://console.aws.amazon.com/iam',
        },
        {
          key: 'AWS_SECRET_ACCESS_KEY',
          description: 'AWS secret access key',
          required: true,
          example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
          howToGet: 'Create IAM user in AWS Console',
          link: 'https://console.aws.amazon.com/iam',
        },
        {
          key: 'AWS_REGION',
          description: 'AWS region for Bedrock',
          required: true,
          example: 'us-east-1',
          howToGet: 'Choose region where Bedrock is available',
        }
      );
    }

    if (aiProvider === 'gemini') {
      vars.push({
        key: 'GOOGLE_AI_API_KEY',
        description: 'Google AI API key for Gemini',
        required: true,
        example: 'AIzaSy...',
        howToGet: 'Get from Google AI Studio',
        link: 'https://makersuite.google.com/app/apikey',
      });
    }

    return vars;
  }

  /**
   * Get Redis environment variables
   */
  private getRedisEnvVars(): EnvironmentVariable[] {
    return [
      {
        key: 'REDIS_URL',
        description: 'Redis connection URL',
        required: true,
        example: 'redis://default:password@host:6379',
        howToGet:
          'Create a Redis instance on your platform or use a service like Upstash or Redis Cloud',
        link: 'https://upstash.com',
      },
    ];
  }
}
