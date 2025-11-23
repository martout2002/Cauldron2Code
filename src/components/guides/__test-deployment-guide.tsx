/**
 * Test file for DeploymentGuide component
 * 
 * This file demonstrates the DeploymentGuide component with sample data.
 * To test: Import and render this component in a page.
 */

import { DeploymentGuide } from './DeploymentGuide';
import type { DeploymentGuide as DeploymentGuideType, Platform } from '@/types/deployment-guides';

// Sample platform for testing
const samplePlatform: Platform = {
  id: 'vercel',
  name: 'Vercel',
  description: 'Best for Next.js and frontend frameworks',
  logo: '/icons/platforms/vercel.svg',
  bestFor: ['Next.js', 'React', 'Vue', 'Svelte'],
  features: {
    freeTier: true,
    databaseSupport: true,
    customDomains: true,
    buildMinutes: '100/month free',
    easeOfUse: 'beginner',
  },
  documentationUrl: 'https://vercel.com/docs',
  pricingUrl: 'https://vercel.com/pricing',
};

// Sample deployment guide for testing
const sampleGuide: DeploymentGuideType = {
  id: 'test-guide-vercel-123',
  platform: samplePlatform,
  scaffoldConfig: {
    projectName: 'my-test-app',
    frontendFramework: 'nextjs',
    styling: 'tailwind',
    database: 'postgres-prisma',
    auth: 'nextauth',
    aiTemplate: 'none',
    extras: {
      docker: false,
      githubActions: false,
      prettier: true,
      husky: false,
      redis: false,
    },
    projectStructure: 'frontend-only',
    buildTool: 'npm',
    colorScheme: 'blue',
  },
  estimatedTime: '15-20 minutes',
  steps: [
    {
      id: 'step-1',
      title: 'Install Vercel CLI',
      description: 'Install the Vercel CLI globally on your machine to deploy from the command line.',
      order: 1,
      required: true,
      commands: [
        {
          id: 'cmd-1',
          command: 'npm install -g vercel',
          description: 'Install Vercel CLI globally',
          language: 'bash',
        },
      ],
      notes: [
        'You can also use yarn or pnpm to install the CLI',
        'The CLI requires Node.js 14 or higher',
      ],
    },
    {
      id: 'step-2',
      title: 'Login to Vercel',
      description: 'Authenticate with your Vercel account to enable deployments.',
      order: 2,
      required: true,
      commands: [
        {
          id: 'cmd-2',
          command: 'vercel login',
          description: 'Login to your Vercel account',
          language: 'bash',
        },
      ],
      notes: [
        'This will open a browser window for authentication',
        'You can use GitHub, GitLab, or Bitbucket to sign in',
      ],
    },
    {
      id: 'step-3',
      title: 'Configure Environment Variables',
      description: 'Set up the required environment variables for your application.',
      order: 3,
      required: true,
      substeps: [
        {
          id: 'substep-3-1',
          title: 'Set DATABASE_URL',
          description: 'Configure your PostgreSQL database connection string',
          commands: [
            {
              id: 'cmd-3-1',
              command: 'vercel env add DATABASE_URL',
              description: 'Add DATABASE_URL environment variable',
              language: 'bash',
            },
          ],
        },
        {
          id: 'substep-3-2',
          title: 'Set NextAuth Variables',
          description: 'Configure NextAuth.js authentication variables',
          commands: [
            {
              id: 'cmd-3-2',
              command: 'vercel env add NEXTAUTH_SECRET',
              description: 'Add NEXTAUTH_SECRET environment variable',
              language: 'bash',
            },
            {
              id: 'cmd-3-3',
              command: 'vercel env add NEXTAUTH_URL',
              description: 'Add NEXTAUTH_URL environment variable',
              language: 'bash',
            },
          ],
        },
      ],
      warnings: [
        'Never commit environment variables to your repository',
        'Keep your NEXTAUTH_SECRET secure and random',
      ],
    },
    {
      id: 'step-4',
      title: 'Deploy to Vercel',
      description: 'Deploy your application to production.',
      order: 4,
      required: true,
      commands: [
        {
          id: 'cmd-4',
          command: 'vercel --prod',
          description: 'Deploy to production',
          language: 'bash',
        },
      ],
      notes: [
        'The first deployment will prompt you to link or create a project',
        'Subsequent deployments will be faster',
      ],
    },
  ],
  postDeploymentChecklist: [
    {
      id: 'checklist-1',
      title: 'Update OAuth Callback URLs',
      description: 'Add your deployment URL to OAuth provider settings',
      required: true,
      completed: false,
      externalLinks: [
        {
          text: 'GitHub OAuth Settings',
          url: 'https://github.com/settings/developers',
          type: 'service',
        },
      ],
    },
    {
      id: 'checklist-2',
      title: 'Run Database Migrations',
      description: 'Initialize your database schema',
      required: true,
      completed: false,
      commands: [
        {
          id: 'checklist-cmd-1',
          command: 'npx prisma migrate deploy',
          description: 'Run database migrations',
          language: 'bash',
        },
      ],
    },
    {
      id: 'checklist-3',
      title: 'Test Your Application',
      description: 'Visit your deployment URL and verify everything works',
      required: true,
      completed: false,
    },
    {
      id: 'checklist-4',
      title: 'Add Custom Domain',
      description: 'Configure a custom domain for your application',
      required: false,
      completed: false,
      externalLinks: [
        {
          text: 'Vercel Custom Domains',
          url: 'https://vercel.com/docs/concepts/projects/domains',
          type: 'documentation',
        },
      ],
    },
  ],
  troubleshooting: {
    commonIssues: [
      {
        title: 'Build Fails',
        symptoms: ['Build process exits with error', 'Dependencies not found'],
        causes: [
          'Missing environment variables',
          'Incorrect Node.js version',
          'Missing dependencies in package.json',
        ],
        solutions: [
          'Check that all required environment variables are set',
          'Verify Node.js version matches your local environment',
          'Run npm install locally to verify dependencies',
        ],
        relatedLinks: [
          {
            text: 'Vercel Build Documentation',
            url: 'https://vercel.com/docs/concepts/deployments/builds',
            type: 'documentation',
          },
        ],
      },
      {
        title: 'Database Connection Errors',
        symptoms: ['Cannot connect to database', 'Connection timeout'],
        causes: [
          'Incorrect DATABASE_URL',
          'Database not accessible from Vercel',
          'SSL/TLS configuration issues',
        ],
        solutions: [
          'Verify DATABASE_URL format is correct',
          'Check database allows connections from Vercel',
          'Add ?sslmode=require to connection string if needed',
        ],
      },
    ],
    platformStatusUrl: 'https://www.vercel-status.com',
    communityLinks: [
      {
        text: 'Vercel Community',
        url: 'https://vercel.com/community',
        type: 'documentation',
      },
    ],
  },
};

export function TestDeploymentGuide() {
  return <DeploymentGuide guide={sampleGuide} />;
}
