'use client';

/**
 * Demo page for PostDeploymentChecklist component
 * Navigate to /demos/post-deployment-checklist to view
 */

import { PostDeploymentChecklist } from '@/components';
import type { Deployment } from '@/lib/platforms/types';
import type { ScaffoldConfig } from '@/types';

export default function PostDeploymentChecklistDemo() {
  // Create a sample deployment for demo purposes
  const sampleConfig: ScaffoldConfig = {
    projectName: 'my-saas-app',
    description: 'A sample SaaS application',
    frontendFramework: 'nextjs',
    backendFramework: 'nextjs-api',
    buildTool: 'auto',
    projectStructure: 'nextjs-only',
    nextjsRouter: 'app',
    auth: 'nextauth',
    database: 'prisma-postgres',
    api: 'rest-fetch',
    styling: 'tailwind',
    shadcn: true,
    colorScheme: 'purple',
    deployment: ['vercel'],
    aiTemplates: ['chatbot'],
    aiProvider: 'anthropic',
    extras: {
      docker: false,
      githubActions: true,
      redis: false,
      prettier: true,
      husky: false,
    },
    githubEnabled: false,
    githubRepoPrivate: false,
  };

  const sampleDeployment: Deployment = {
    id: 'demo-deployment-123',
    userId: 'demo-user',
    projectName: 'my-saas-app',
    platform: 'vercel',
    status: 'success',
    deploymentUrl: 'https://my-saas-app.vercel.app',
    services: [],
    config: {
      projectName: 'my-saas-app',
      platform: 'vercel',
      scaffoldConfig: sampleConfig,
      environmentVariables: [
        {
          key: 'DATABASE_URL',
          value: 'postgresql://user:pass@host:5432/db',
          description: 'Database connection string',
          required: true,
          sensitive: true,
        },
        {
          key: 'NEXTAUTH_SECRET',
          value: 'secret-key-here',
          description: 'NextAuth secret',
          required: true,
          sensitive: true,
        },
      ],
      services: [],
    },
    buildLogs: [],
    createdAt: new Date(),
    completedAt: new Date(),
    duration: 120000,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Post-Deployment Checklist Demo
          </h1>
          <p className="text-gray-600">
            This is a demo of the PostDeploymentChecklist component showing
            setup tasks after a successful deployment.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <PostDeploymentChecklist deployment={sampleDeployment} />
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Demo Features:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Check/uncheck items to mark them as complete</li>
            <li>✓ Copy commands with the hover button</li>
            <li>✓ Click links to open documentation</li>
            <li>✓ Copy all instructions with the &quot;Copy Instructions&quot; button</li>
            <li>
              ✓ Complete all required items to see the success message
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
