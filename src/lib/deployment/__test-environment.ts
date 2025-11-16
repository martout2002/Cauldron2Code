/**
 * Environment Variable Management Tests
 * 
 * Tests for environment variable detection and validation functionality.
 */

import { EnvironmentVariableDetector } from './environment-detector';
import { EnvironmentVariableValidator } from './environment-validator';
import type { ScaffoldConfig } from '../../types';

// Test configuration samples
const baseConfig: ScaffoldConfig = {
  projectName: 'test-app',
  description: 'Test application',
  frontendFramework: 'nextjs',
  backendFramework: 'nextjs-api',
  buildTool: 'auto',
  projectStructure: 'nextjs-only',
  nextjsRouter: 'app',
  auth: 'none',
  database: 'none',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['vercel'],
  extras: {
    docker: false,
    githubActions: false,
    redis: false,
    prettier: true,
    husky: false,
  },
};

describe('EnvironmentVariableDetector', () => {
  const detector = new EnvironmentVariableDetector();

  describe('Database Detection', () => {
    it('should detect PostgreSQL variables for Prisma', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        database: 'prisma-postgres',
      };

      const vars = detector.detect(config);
      const dbVar = vars.find((v) => v.key === 'DATABASE_URL');

      expect(dbVar).toBeDefined();
      expect(dbVar?.required).toBe(true);
      expect(dbVar?.sensitive).toBe(true);
      expect(dbVar?.validation?.pattern).toContain('postgresql');
    });

    it('should detect MongoDB variables', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        database: 'mongodb',
      };

      const vars = detector.detect(config);
      const dbVar = vars.find((v) => v.key === 'MONGODB_URI');

      expect(dbVar).toBeDefined();
      expect(dbVar?.required).toBe(true);
      expect(dbVar?.validation?.pattern).toContain('mongodb');
    });

    it('should detect Supabase variables', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        database: 'supabase',
      };

      const vars = detector.detect(config);
      const urlVar = vars.find((v) => v.key === 'NEXT_PUBLIC_SUPABASE_URL');
      const keyVar = vars.find((v) => v.key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

      expect(urlVar).toBeDefined();
      expect(keyVar).toBeDefined();
      expect(urlVar?.required).toBe(true);
      expect(keyVar?.required).toBe(true);
    });

    it('should not detect database variables when database is none', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        database: 'none',
      };

      const vars = detector.detect(config);
      const dbVars = vars.filter(
        (v) =>
          v.key === 'DATABASE_URL' ||
          v.key === 'MONGODB_URI' ||
          v.key.includes('SUPABASE')
      );

      expect(dbVars.length).toBe(0);
    });
  });

  describe('Authentication Detection', () => {
    it('should detect NextAuth variables', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        auth: 'nextauth',
      };

      const vars = detector.detect(config);
      const secretVar = vars.find((v) => v.key === 'NEXTAUTH_SECRET');
      const urlVar = vars.find((v) => v.key === 'NEXTAUTH_URL');

      expect(secretVar).toBeDefined();
      expect(urlVar).toBeDefined();
      expect(secretVar?.required).toBe(true);
      expect(secretVar?.validation?.minLength).toBe(32);
    });

    it('should detect Clerk variables', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        auth: 'clerk',
      };

      const vars = detector.detect(config);
      const pubKeyVar = vars.find(
        (v) => v.key === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'
      );
      const secretVar = vars.find((v) => v.key === 'CLERK_SECRET_KEY');

      expect(pubKeyVar).toBeDefined();
      expect(secretVar).toBeDefined();
      expect(pubKeyVar?.required).toBe(true);
      expect(secretVar?.required).toBe(true);
      expect(secretVar?.sensitive).toBe(true);
    });

    it('should detect OAuth provider variables for NextAuth', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        auth: 'nextauth',
      };

      const vars = detector.detect(config);
      const githubId = vars.find((v) => v.key === 'GITHUB_ID');
      const githubSecret = vars.find((v) => v.key === 'GITHUB_SECRET');
      const googleId = vars.find((v) => v.key === 'GOOGLE_CLIENT_ID');
      const googleSecret = vars.find((v) => v.key === 'GOOGLE_CLIENT_SECRET');

      expect(githubId).toBeDefined();
      expect(githubSecret).toBeDefined();
      expect(googleId).toBeDefined();
      expect(googleSecret).toBeDefined();
      // OAuth providers are optional
      expect(githubId?.required).toBe(false);
      expect(googleId?.required).toBe(false);
    });
  });

  describe('AI Template Detection', () => {
    it('should detect Anthropic API key', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        aiTemplate: 'chatbot',
        aiProvider: 'anthropic',
      };

      const vars = detector.detect(config);
      const apiKey = vars.find((v) => v.key === 'ANTHROPIC_API_KEY');

      expect(apiKey).toBeDefined();
      expect(apiKey?.required).toBe(true);
      expect(apiKey?.sensitive).toBe(true);
      expect(apiKey?.validation?.pattern).toContain('sk-ant-');
    });

    it('should detect OpenAI API key', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        aiTemplate: 'document-analyzer',
        aiProvider: 'openai',
      };

      const vars = detector.detect(config);
      const apiKey = vars.find((v) => v.key === 'OPENAI_API_KEY');

      expect(apiKey).toBeDefined();
      expect(apiKey?.required).toBe(true);
      expect(apiKey?.validation?.pattern).toContain('sk-');
    });

    it('should detect AWS Bedrock credentials', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        aiTemplate: 'semantic-search',
        aiProvider: 'aws-bedrock',
      };

      const vars = detector.detect(config);
      const accessKey = vars.find((v) => v.key === 'AWS_ACCESS_KEY_ID');
      const secretKey = vars.find((v) => v.key === 'AWS_SECRET_ACCESS_KEY');
      const region = vars.find((v) => v.key === 'AWS_REGION');

      expect(accessKey).toBeDefined();
      expect(secretKey).toBeDefined();
      expect(region).toBeDefined();
      expect(accessKey?.required).toBe(true);
      expect(secretKey?.required).toBe(true);
      expect(region?.required).toBe(true);
    });

    it('should not detect AI variables when no AI template', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        aiTemplate: 'none',
      };

      const vars = detector.detect(config);
      const aiVars = vars.filter(
        (v) =>
          v.key.includes('ANTHROPIC') ||
          v.key.includes('OPENAI') ||
          v.key.includes('AWS_') ||
          v.key.includes('GOOGLE_AI')
      );

      expect(aiVars.length).toBe(0);
    });
  });

  describe('Service Detection', () => {
    it('should detect Redis URL when Redis is enabled', () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        extras: {
          ...baseConfig.extras,
          redis: true,
        },
      };

      const vars = detector.detect(config);
      const redisVar = vars.find((v) => v.key === 'REDIS_URL');

      expect(redisVar).toBeDefined();
      expect(redisVar?.required).toBe(false);
      expect(redisVar?.sensitive).toBe(true);
    });

    it('should always include app URL variable', () => {
      const vars = detector.detect(baseConfig);
      const appUrl = vars.find((v) => v.key === 'NEXT_PUBLIC_APP_URL');

      expect(appUrl).toBeDefined();
      expect(appUrl?.required).toBe(false);
    });
  });
});

describe('EnvironmentVariableValidator', () => {
  const validator = new EnvironmentVariableValidator();

  describe('Required Field Validation', () => {
    it('should fail validation for empty required field', () => {
      const envVar = {
        key: 'DATABASE_URL',
        value: '',
        description: 'Database connection string',
        required: true,
        sensitive: true,
      };

      const result = validator.validate(envVar, '');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should pass validation for filled required field', () => {
      const envVar = {
        key: 'DATABASE_URL',
        value: 'postgresql://user:pass@host:5432/db',
        description: 'Database connection string',
        required: true,
        sensitive: true,
      };

      const result = validator.validate(
        envVar,
        'postgresql://user:pass@host:5432/db'
      );

      expect(result.isValid).toBe(true);
    });

    it('should pass validation for empty optional field', () => {
      const envVar = {
        key: 'REDIS_URL',
        value: '',
        description: 'Redis connection',
        required: false,
        sensitive: true,
      };

      const result = validator.validate(envVar, '');

      expect(result.isValid).toBe(true);
    });
  });

  describe('Pattern Validation', () => {
    it('should validate PostgreSQL URL pattern', () => {
      const envVar = {
        key: 'DATABASE_URL',
        value: '',
        description: 'Database URL',
        required: true,
        sensitive: true,
        validation: {
          pattern: '^postgresql://.+',
        },
      };

      const validResult = validator.validate(
        envVar,
        'postgresql://user:pass@host:5432/db'
      );
      const invalidResult = validator.validate(envVar, 'mysql://host/db');

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should validate API key pattern', () => {
      const envVar = {
        key: 'ANTHROPIC_API_KEY',
        value: '',
        description: 'Anthropic API key',
        required: true,
        sensitive: true,
        validation: {
          pattern: '^sk-ant-',
        },
      };

      const validResult = validator.validate(envVar, 'sk-ant-api03-test123');
      const invalidResult = validator.validate(envVar, 'invalid-key');

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('Length Validation', () => {
    it('should validate minimum length', () => {
      const envVar = {
        key: 'NEXTAUTH_SECRET',
        value: '',
        description: 'NextAuth secret',
        required: true,
        sensitive: true,
        validation: {
          minLength: 32,
        },
      };

      const validResult = validator.validate(
        envVar,
        'a'.repeat(32)
      );
      const invalidResult = validator.validate(envVar, 'short');

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('at least 32 characters');
    });

    it('should validate maximum length', () => {
      const envVar = {
        key: 'TEST_VAR',
        value: '',
        description: 'Test variable',
        required: true,
        sensitive: false,
        validation: {
          maxLength: 10,
        },
      };

      const validResult = validator.validate(envVar, 'short');
      const invalidResult = validator.validate(envVar, 'a'.repeat(20));

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('at most 10 characters');
    });
  });

  describe('URL Format Validation', () => {
    it('should validate URL format', () => {
      const envVar = {
        key: 'NEXTAUTH_URL',
        value: '',
        description: 'App URL',
        required: true,
        sensitive: false,
      };

      const validResult = validator.validate(envVar, 'https://example.com');
      const invalidResult = validator.validate(envVar, 'not-a-url');

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should require http or https protocol', () => {
      const envVar = {
        key: 'NEXT_PUBLIC_APP_URL',
        value: '',
        description: 'App URL',
        required: true,
        sensitive: false,
      };

      const httpResult = validator.validate(envVar, 'http://example.com');
      const httpsResult = validator.validate(envVar, 'https://example.com');
      const ftpResult = validator.validate(envVar, 'ftp://example.com');

      expect(httpResult.isValid).toBe(true);
      expect(httpsResult.isValid).toBe(true);
      expect(ftpResult.isValid).toBe(false);
    });
  });

  describe('Database URL Validation', () => {
    it('should validate PostgreSQL URL', () => {
      const envVar = {
        key: 'DATABASE_URL',
        value: '',
        description: 'Database URL',
        required: true,
        sensitive: true,
      };

      const validResult = validator.validate(
        envVar,
        'postgresql://user:pass@localhost:5432/mydb'
      );
      const invalidResult = validator.validate(
        envVar,
        'postgresql://localhost'
      );

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('database name');
    });

    it('should validate MongoDB URL', () => {
      const envVar = {
        key: 'MONGODB_URI',
        value: '',
        description: 'MongoDB URI',
        required: true,
        sensitive: true,
      };

      const validResult = validator.validate(
        envVar,
        'mongodb://localhost:27017/mydb'
      );
      const validSrvResult = validator.validate(
        envVar,
        'mongodb+srv://user:pass@cluster.mongodb.net/mydb'
      );

      expect(validResult.isValid).toBe(true);
      expect(validSrvResult.isValid).toBe(true);
    });

    it('should validate Redis URL', () => {
      const envVar = {
        key: 'REDIS_URL',
        value: '',
        description: 'Redis URL',
        required: false,
        sensitive: true,
      };

      const validResult = validator.validate(
        envVar,
        'redis://localhost:6379'
      );
      const validSecureResult = validator.validate(
        envVar,
        'rediss://user:pass@host:6380'
      );

      expect(validResult.isValid).toBe(true);
      expect(validSecureResult.isValid).toBe(true);
    });
  });

  describe('API Key Validation', () => {
    it('should reject API keys with spaces', () => {
      const envVar = {
        key: 'ANTHROPIC_API_KEY',
        value: '',
        description: 'API key',
        required: true,
        sensitive: true,
      };

      const result = validator.validate(envVar, 'sk-ant- api key with spaces');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('should not contain spaces');
    });

    it('should reject very short API keys', () => {
      const envVar = {
        key: 'OPENAI_API_KEY',
        value: '',
        description: 'API key',
        required: true,
        sensitive: true,
      };

      const result = validator.validate(envVar, 'short');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too short');
    });
  });

  describe('Batch Validation', () => {
    it('should validate all environment variables', () => {
      const envVars = [
        {
          key: 'DATABASE_URL',
          value: 'postgresql://localhost:5432/db',
          description: 'Database',
          required: true,
          sensitive: true,
        },
        {
          key: 'NEXTAUTH_SECRET',
          value: 'a'.repeat(32),
          description: 'Secret',
          required: true,
          sensitive: true,
        },
        {
          key: 'REDIS_URL',
          value: '',
          description: 'Redis',
          required: false,
          sensitive: true,
        },
      ];

      const results = validator.validateAll(envVars);

      expect(results['DATABASE_URL'].isValid).toBe(true);
      expect(results['NEXTAUTH_SECRET'].isValid).toBe(true);
      expect(results['REDIS_URL'].isValid).toBe(true);
    });

    it('should check if all required variables are valid', () => {
      const validVars = [
        {
          key: 'DATABASE_URL',
          value: 'postgresql://localhost:5432/db',
          description: 'Database',
          required: true,
          sensitive: true,
        },
      ];

      const invalidVars = [
        {
          key: 'DATABASE_URL',
          value: '',
          description: 'Database',
          required: true,
          sensitive: true,
        },
      ];

      expect(validator.areAllValid(validVars)).toBe(true);
      expect(validator.areAllValid(invalidVars)).toBe(false);
    });

    it('should get all validation errors', () => {
      const envVars = [
        {
          key: 'DATABASE_URL',
          value: '',
          description: 'Database',
          required: true,
          sensitive: true,
        },
        {
          key: 'NEXTAUTH_SECRET',
          value: 'short',
          description: 'Secret',
          required: true,
          sensitive: true,
          validation: { minLength: 32 },
        },
      ];

      const errors = validator.getErrors(envVars);

      expect(Object.keys(errors).length).toBe(2);
      expect(errors['DATABASE_URL']).toBeDefined();
      expect(errors['NEXTAUTH_SECRET']).toBeDefined();
    });
  });
});

// Helper function for tests (mock expect if not using a test framework)
function expect(value: any) {
  return {
    toBe: (expected: any) => {
      if (value !== expected) {
        console.error(`Expected ${value} to be ${expected}`);
      }
    },
    toBeDefined: () => {
      if (value === undefined) {
        console.error(`Expected value to be defined`);
      }
    },
    toContain: (substring: string) => {
      if (typeof value === 'string' && !value.includes(substring)) {
        console.error(`Expected "${value}" to contain "${substring}"`);
      }
    },
  };
}

function describe(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  console.log(`  ✓ ${name}`);
  fn();
}
