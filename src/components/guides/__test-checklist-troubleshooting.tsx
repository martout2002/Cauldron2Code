/**
 * Test file for ChecklistSection and TroubleshootingSection components
 * 
 * This file demonstrates the usage of both components with sample data.
 * To test, import this component in a page and render it.
 */

'use client';

import { useState } from 'react';
import { ChecklistSection } from './ChecklistSection';
import { TroubleshootingSection } from './TroubleshootingSection';
import type { 
  ChecklistItem, 
  TroubleshootingSection as TroubleshootingSectionType 
} from '../../types/deployment-guides';

export function TestChecklistAndTroubleshooting() {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Sample checklist items
  const checklistItems: ChecklistItem[] = [
    {
      id: 'oauth-callbacks',
      title: 'Update OAuth Callback URLs',
      description: 'Add your deployment URL to OAuth provider settings (GitHub, Google, etc.)',
      required: true,
      externalLinks: [
        {
          text: 'GitHub OAuth Settings',
          url: 'https://github.com/settings/developers',
          type: 'service',
        },
        {
          text: 'Google OAuth Settings',
          url: 'https://console.cloud.google.com/apis/credentials',
          type: 'service',
        },
      ],
      completed: false,
    },
    {
      id: 'database-migrations',
      title: 'Run Database Migrations',
      description: 'Initialize your database schema with the latest migrations',
      required: true,
      commands: [
        {
          id: 'migration-cmd',
          command: 'npx prisma migrate deploy',
          description: 'Run this in your project directory',
          language: 'bash',
        },
      ],
      completed: false,
    },
    {
      id: 'test-application',
      title: 'Test Your Deployed Application',
      description: 'Visit your deployment URL and verify all features work correctly',
      required: true,
      completed: false,
    },
    {
      id: 'custom-domain',
      title: 'Add Custom Domain (Optional)',
      description: 'Configure a custom domain for your application',
      required: false,
      externalLinks: [
        {
          text: 'Vercel Custom Domains',
          url: 'https://vercel.com/docs/concepts/projects/domains',
          type: 'documentation',
        },
      ],
      completed: false,
    },
    {
      id: 'setup-monitoring',
      title: 'Set Up Monitoring (Optional)',
      description: 'Add error tracking and performance monitoring to your application',
      required: false,
      externalLinks: [
        {
          text: 'Sentry',
          url: 'https://sentry.io',
          type: 'service',
        },
        {
          text: 'LogRocket',
          url: 'https://logrocket.com',
          type: 'service',
        },
      ],
      completed: false,
    },
  ];

  // Sample troubleshooting data
  const troubleshooting: TroubleshootingSectionType = {
    commonIssues: [
      {
        title: 'Build Fails',
        symptoms: [
          'Build process exits with error code',
          'Dependencies not found during build',
          'TypeScript compilation errors',
        ],
        causes: [
          'Missing environment variables',
          'Incorrect Node.js version',
          'Missing dependencies in package.json',
          'TypeScript configuration issues',
        ],
        solutions: [
          'Check that all required environment variables are set in your platform dashboard',
          'Verify Node.js version matches your local environment (check package.json engines field)',
          'Run npm install locally to verify all dependencies are listed',
          'Review build logs for specific error messages',
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
        title: 'Application Won\'t Start',
        symptoms: [
          'Deployment succeeds but app shows error page',
          '502 Bad Gateway or 503 Service Unavailable errors',
          'Application crashes immediately after starting',
        ],
        causes: [
          'Incorrect start command in platform settings',
          'Port configuration issues',
          'Database connection failures',
          'Missing runtime environment variables',
        ],
        solutions: [
          'Verify your start command in platform settings matches package.json scripts',
          'Ensure your app listens on the PORT environment variable provided by the platform',
          'Check DATABASE_URL is correctly set and accessible',
          'Review application logs for startup errors',
        ],
      },
      {
        title: 'Database Connection Errors',
        symptoms: [
          'Cannot connect to database',
          'Connection timeout errors',
          'SSL/TLS handshake failures',
        ],
        causes: [
          'Incorrect DATABASE_URL format',
          'Database not accessible from platform',
          'SSL/TLS configuration issues',
          'Database credentials expired or invalid',
        ],
        solutions: [
          'Verify DATABASE_URL format is correct for your database type',
          'Check database firewall allows connections from your platform',
          'Add ?sslmode=require to connection string if needed',
          'Test connection string locally before deploying',
        ],
        relatedLinks: [
          {
            text: 'Database Connection Guide',
            url: 'https://vercel.com/docs/storage/vercel-postgres/quickstart',
            type: 'documentation',
          },
        ],
      },
      {
        title: 'Environment Variable Issues',
        symptoms: [
          'Features that work locally fail in production',
          'API keys not being recognized',
          'Configuration values are undefined',
        ],
        causes: [
          'Environment variables not set in platform',
          'Incorrect variable names (typos)',
          'Variables not exposed to client-side code (missing NEXT_PUBLIC_ prefix)',
        ],
        solutions: [
          'Double-check all environment variables are set in your platform dashboard',
          'Verify variable names match exactly (case-sensitive)',
          'For Next.js, ensure client-side variables start with NEXT_PUBLIC_',
          'Redeploy after adding new environment variables',
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
      {
        text: 'Discord Server',
        url: 'https://vercel.com/discord',
        type: 'documentation',
      },
    ],
  };

  const handleToggleItem = (itemId: string) => {
    setCompletedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      return [...prev, itemId];
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Checklist & Troubleshooting Test</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This page demonstrates the ChecklistSection and TroubleshootingSection components.
        </p>
      </div>

      <ChecklistSection
        items={checklistItems}
        completedItems={completedItems}
        onToggleItem={handleToggleItem}
      />

      <TroubleshootingSection troubleshooting={troubleshooting} />
    </div>
  );
}
