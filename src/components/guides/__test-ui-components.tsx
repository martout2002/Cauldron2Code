/**
 * Test file to verify UI components render correctly
 * This is a manual test component - not automated tests
 */

import { CommandBlock } from './CommandBlock';
import { CodeBlock } from './CodeBlock';
import { GuideStep } from './GuideStep';
import { GuideProgress } from './GuideProgress';
import { ViewModeToggle } from './ViewModeToggle';
import type { DeploymentStep, CommandSnippet, CodeSnippet } from '@/types/deployment-guides';

// Sample data for testing
const sampleCommand: CommandSnippet = {
  id: 'test-cmd-1',
  command: 'vercel env add DATABASE_URL',
  description: 'Add database URL environment variable',
  language: 'bash',
  placeholders: [
    {
      key: 'DATABASE_URL',
      description: 'Your PostgreSQL connection string',
      example: 'postgresql://user:password@host:5432/dbname',
    },
  ],
};

const sampleCode: CodeSnippet = {
  id: 'test-code-1',
  title: 'Environment Configuration',
  code: `DATABASE_URL=postgresql://localhost:5432/mydb
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000`,
  language: 'bash',
  filename: '.env.local',
  description: 'Add these environment variables to your .env.local file',
};

const sampleStep: DeploymentStep = {
  id: 'test-step-1',
  title: 'Configure Environment Variables',
  description: 'Set up the required environment variables for your application',
  order: 1,
  required: true,
  commands: [sampleCommand],
  codeSnippets: [sampleCode],
  notes: ['Keep your environment variables secure', 'Never commit secrets to your repository'],
  warnings: ['Make sure to use strong passwords for production databases'],
  externalLinks: [
    {
      text: 'Vercel Environment Variables Documentation',
      url: 'https://vercel.com/docs/environment-variables',
      type: 'documentation',
    },
  ],
  substeps: [
    {
      id: 'substep-1',
      title: 'Create .env.local file',
      description: 'Create a new file in your project root',
      commands: [
        {
          id: 'substep-cmd-1',
          command: 'touch .env.local',
          description: 'Create environment file',
          language: 'bash',
        },
      ],
    },
  ],
};

export function TestUIComponents() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Deployment Guide UI Components Test</h1>

      <section>
        <h2 className="text-2xl font-bold mb-4">ViewModeToggle</h2>
        <ViewModeToggle mode="detailed" onChange={(mode) => console.log('Mode:', mode)} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">GuideProgress</h2>
        <GuideProgress completed={3} total={10} />
        <div className="mt-4">
          <GuideProgress completed={10} total={10} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">CommandBlock</h2>
        <CommandBlock command={sampleCommand} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">CodeBlock</h2>
        <CodeBlock snippet={sampleCode} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">GuideStep</h2>
        <GuideStep
          step={sampleStep}
          completed={false}
          viewMode="detailed"
          onToggleComplete={() => console.log('Toggle complete')}
          guideId="test-guide"
        />
      </section>
    </div>
  );
}
