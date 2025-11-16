'use client';

/**
 * WhatsNextGuide Component
 * 
 * Provides guidance on recommended next steps after deployment,
 * links to platform documentation, and troubleshooting resources.
 * 
 * Requirements 11.5, 11.6: Show recommended next steps and provide troubleshooting
 */

import { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Settings,
  Globe,
  Database,
  Shield,
  Zap,
  BookOpen,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { Deployment, PlatformType } from '@/lib/platforms/types';

interface WhatsNextGuideProps {
  deployment: Deployment;
}

interface NextStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    text: string;
    url: string;
  };
  priority: 'high' | 'medium' | 'low';
}

const PLATFORM_DOCS: Record<
  PlatformType,
  {
    name: string;
    links: {
      title: string;
      description: string;
      url: string;
    }[];
  }
> = {
  vercel: {
    name: 'Vercel',
    links: [
      {
        title: 'Custom Domains',
        description: 'Add your own domain to your deployment',
        url: 'https://vercel.com/docs/concepts/projects/custom-domains',
      },
      {
        title: 'Environment Variables',
        description: 'Manage environment variables for different environments',
        url: 'https://vercel.com/docs/concepts/projects/environment-variables',
      },
      {
        title: 'Deployment Protection',
        description: 'Add password protection or IP allowlisting',
        url: 'https://vercel.com/docs/security/deployment-protection',
      },
      {
        title: 'Analytics',
        description: 'Monitor your application performance',
        url: 'https://vercel.com/docs/analytics',
      },
      {
        title: 'Logs & Monitoring',
        description: 'View runtime logs and errors',
        url: 'https://vercel.com/docs/observability/runtime-logs',
      },
    ],
  },
  railway: {
    name: 'Railway',
    links: [
      {
        title: 'Custom Domains',
        description: 'Configure your custom domain',
        url: 'https://docs.railway.app/deploy/custom-domains',
      },
      {
        title: 'Database Management',
        description: 'Manage your PostgreSQL database',
        url: 'https://docs.railway.app/databases/postgresql',
      },
      {
        title: 'Environment Variables',
        description: 'Update and manage environment variables',
        url: 'https://docs.railway.app/develop/variables',
      },
      {
        title: 'Metrics & Logs',
        description: 'Monitor your service metrics and logs',
        url: 'https://docs.railway.app/deploy/metrics',
      },
      {
        title: 'Scaling',
        description: 'Scale your application resources',
        url: 'https://docs.railway.app/deploy/scaling',
      },
    ],
  },
  render: {
    name: 'Render',
    links: [
      {
        title: 'Custom Domains',
        description: 'Add your custom domain',
        url: 'https://render.com/docs/custom-domains',
      },
      {
        title: 'Environment Variables',
        description: 'Manage environment variables',
        url: 'https://render.com/docs/environment-variables',
      },
      {
        title: 'Database Backups',
        description: 'Configure automatic database backups',
        url: 'https://render.com/docs/postgresql#backups',
      },
      {
        title: 'Logs',
        description: 'View application logs',
        url: 'https://render.com/docs/logs',
      },
      {
        title: 'Health Checks',
        description: 'Configure health check endpoints',
        url: 'https://render.com/docs/health-checks',
      },
    ],
  },
};

const TROUBLESHOOTING_RESOURCES = [
  {
    issue: 'Application not loading',
    solutions: [
      'Check build logs for errors',
      'Verify all environment variables are set correctly',
      'Ensure database is accessible',
      'Check for port configuration issues',
    ],
  },
  {
    issue: 'Database connection errors',
    solutions: [
      'Verify DATABASE_URL is correct',
      'Check database is running and accessible',
      'Ensure SSL mode is configured if required',
      'Run database migrations',
    ],
  },
  {
    issue: 'Authentication not working',
    solutions: [
      'Update OAuth callback URLs with deployment URL',
      'Verify NEXTAUTH_URL matches deployment URL',
      'Check API keys are correct',
      'Ensure NEXTAUTH_SECRET is set',
    ],
  },
  {
    issue: 'Build failures',
    solutions: [
      'Review build logs for specific errors',
      'Check package.json dependencies',
      'Verify build command is correct',
      'Ensure Node.js version is compatible',
    ],
  },
];

export function WhatsNextGuide({ deployment }: WhatsNextGuideProps) {
  const [activeTab, setActiveTab] = useState<'steps' | 'docs' | 'troubleshooting'>('steps');
  const nextSteps = generateNextSteps(deployment);
  const platformDocs = PLATFORM_DOCS[deployment.platform];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's Next?</h2>
        <p className="text-gray-600">
          Your application is deployed! Here are some recommended next steps to get
          the most out of your deployment.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'steps'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Recommended Steps
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'docs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Platform Documentation
          </button>
          <button
            onClick={() => setActiveTab('troubleshooting')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'troubleshooting'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Troubleshooting
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'steps' && (
          <NextStepsView steps={nextSteps} deployment={deployment} />
        )}
        {activeTab === 'docs' && <PlatformDocsView docs={platformDocs} />}
        {activeTab === 'troubleshooting' && <TroubleshootingView />}
      </div>
    </div>
  );
}

function NextStepsView({
  steps,
  deployment,
}: {
  steps: NextStep[];
  deployment: Deployment;
}) {
  const highPriority = steps.filter((s) => s.priority === 'high');
  const mediumPriority = steps.filter((s) => s.priority === 'medium');
  const lowPriority = steps.filter((s) => s.priority === 'low');

  return (
    <div className="space-y-6">
      {/* High Priority */}
      {highPriority.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🔥 High Priority
          </h3>
          <div className="space-y-3">
            {highPriority.map((step) => (
              <NextStepCard key={step.id} step={step} />
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority */}
      {mediumPriority.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            ⭐ Recommended
          </h3>
          <div className="space-y-3">
            {mediumPriority.map((step) => (
              <NextStepCard key={step.id} step={step} />
            ))}
          </div>
        </div>
      )}

      {/* Low Priority */}
      {lowPriority.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            💡 Optional Enhancements
          </h3>
          <div className="space-y-3">
            {lowPriority.map((step) => (
              <NextStepCard key={step.id} step={step} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Access</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <a
            href={deployment.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-blue-600" />
              <span className="font-medium text-gray-900">View Live Site</span>
            </div>
            <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600" />
          </a>
          <a
            href={`https://${deployment.platform}.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-blue-600" />
              <span className="font-medium text-gray-900">Platform Dashboard</span>
            </div>
            <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600" />
          </a>
        </div>
      </div>
    </div>
  );
}

function NextStepCard({ step }: { step: NextStep }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-1">{step.icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
          <p className="text-sm text-gray-600 mb-3">{step.description}</p>
          {step.action && (
            <a
              href={step.action.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              {step.action.text}
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function PlatformDocsView({
  docs,
}: {
  docs: { name: string; links: { title: string; description: string; url: string }[] };
}) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Explore {docs.name} documentation to learn more about managing and
        optimizing your deployment.
      </p>
      <div className="space-y-3">
        {docs.links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={18} className="text-blue-600" />
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">
                  {link.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600">{link.description}</p>
            </div>
            <ExternalLink
              size={16}
              className="text-gray-400 group-hover:text-blue-600 shrink-0 ml-3 mt-1"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function TroubleshootingView() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <HelpCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium mb-1">
            Need Help?
          </p>
          <p className="text-sm text-blue-800">
            If you're experiencing issues, check these common problems and
            solutions below. You can also check your platform's status page or
            contact their support.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {TROUBLESHOOTING_RESOURCES.map((resource, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 hover:bg-yellow-50 transition-all"
          >
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
              <h4 className="font-semibold text-gray-900">{resource.issue}</h4>
            </div>
            <ul className="space-y-2 ml-6">
              {resource.solutions.map((solution, sIndex) => (
                <li key={sIndex} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-green-600" />
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Additional Resources */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Additional Resources
        </h3>
        <div className="space-y-2">
          <a
            href="https://stackoverflow.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <span className="text-sm font-medium text-gray-900">
              Stack Overflow Community
            </span>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600" />
          </a>
          <a
            href="https://github.com/cauldron2code/cauldron2code/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <span className="text-sm font-medium text-gray-900">
              Cauldron2Code Community Discussions
            </span>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600" />
          </a>
        </div>
      </div>
    </div>
  );
}

function generateNextSteps(deployment: Deployment): NextStep[] {
  const steps: NextStep[] = [];
  const config = deployment.config.scaffoldConfig;

  // Test application
  steps.push({
    id: 'test-app',
    icon: <CheckCircle2 size={20} className="text-green-600" />,
    title: 'Test Your Application',
    description:
      'Visit your live site and verify all features are working correctly. Test authentication, database operations, and any API integrations.',
    action: deployment.deploymentUrl ? {
      text: 'Open Application',
      url: deployment.deploymentUrl,
    } : undefined,
    priority: 'high',
  });

  // Update OAuth callbacks if auth is configured
  if (config.auth && config.auth !== 'none') {
    steps.push({
      id: 'oauth-callbacks',
      icon: <Shield size={20} className="text-blue-600" />,
      title: 'Update OAuth Callback URLs',
      description:
        'Update your OAuth provider settings with your deployment URL to enable social authentication.',
      priority: 'high',
    });
  }

  // Run migrations if database is configured
  if (config.database && config.database !== 'none') {
    steps.push({
      id: 'run-migrations',
      icon: <Database size={20} className="text-purple-600" />,
      title: 'Run Database Migrations',
      description:
        'Initialize your database schema by running migrations. This sets up all necessary tables and relationships.',
      priority: 'high',
    });
  }

  // Add custom domain
  const customDomainLink = PLATFORM_DOCS[deployment.platform]?.links[0];
  steps.push({
    id: 'custom-domain',
    icon: <Globe size={20} className="text-blue-600" />,
    title: 'Add Custom Domain',
    description:
      'Configure a custom domain for your application to give it a professional URL.',
    action: customDomainLink ? {
      text: 'View Documentation',
      url: customDomainLink.url,
    } : undefined,
    priority: 'medium',
  });

  // Set up monitoring
  steps.push({
    id: 'monitoring',
    icon: <Zap size={20} className="text-yellow-600" />,
    title: 'Set Up Monitoring',
    description:
      'Configure monitoring and alerts to track your application performance and catch issues early.',
    priority: 'medium',
  });

  // Configure environment for production
  steps.push({
    id: 'production-env',
    icon: <Settings size={20} className="text-gray-600" />,
    title: 'Review Environment Variables',
    description:
      'Ensure all environment variables are set correctly for production. Replace any test/development keys with production keys.',
    priority: 'medium',
  });

  // Enable analytics
  steps.push({
    id: 'analytics',
    icon: <BookOpen size={20} className="text-indigo-600" />,
    title: 'Enable Analytics',
    description:
      'Set up analytics to understand how users interact with your application.',
    priority: 'low',
  });

  return steps;
}
