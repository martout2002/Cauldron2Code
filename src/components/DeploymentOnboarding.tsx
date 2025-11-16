'use client';

/**
 * DeploymentOnboarding Component
 * 
 * Provides an introduction to the automated deployment feature,
 * explaining what it does, platform benefits, and the deployment process.
 * Requirement 11.1: Add explanation of automated deployment feature
 */

import { useState } from 'react';
import { X, Rocket, Zap, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

interface DeploymentOnboardingProps {
  onClose: () => void;
  onGetStarted: () => void;
}

const PLATFORM_BENEFITS = [
  {
    platform: 'Vercel',
    icon: '▲',
    benefits: [
      'Optimized for Next.js and React applications',
      'Global CDN with edge functions',
      'Automatic HTTPS and custom domains',
      'Preview deployments for every commit',
    ],
    bestFor: 'Frontend and full-stack Next.js apps',
  },
  {
    platform: 'Railway',
    icon: '🚂',
    benefits: [
      'Built-in database provisioning',
      'Supports any backend framework',
      'Automatic scaling and monitoring',
      'Simple environment management',
    ],
    bestFor: 'Backend services and APIs with databases',
  },
  {
    platform: 'Render',
    icon: '🎨',
    benefits: [
      'Free tier for web services',
      'Managed PostgreSQL databases',
      'Auto-deploy from Git',
      'Background workers and cron jobs',
    ],
    bestFor: 'Full-stack apps with databases',
  },
];

const DEPLOYMENT_STEPS = [
  {
    step: 1,
    title: 'Connect Platform',
    description: 'Securely connect your hosting platform account via OAuth',
  },
  {
    step: 2,
    title: 'Configure Project',
    description: 'Set project name and environment variables',
  },
  {
    step: 3,
    title: 'Deploy',
    description: 'Cauldron2Code creates the project and deploys your code',
  },
  {
    step: 4,
    title: 'Go Live',
    description: 'Your application is live with a public URL',
  },
];

export function DeploymentOnboarding({
  onClose,
  onGetStarted,
}: DeploymentOnboardingProps) {
  const [currentView, setCurrentView] = useState<'intro' | 'platforms' | 'process'>('intro');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentView === 'intro' && 'Automated Deployment'}
            {currentView === 'platforms' && 'Choose Your Platform'}
            {currentView === 'process' && 'How It Works'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close onboarding"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentView === 'intro' && (
            <IntroView onNext={() => setCurrentView('platforms')} />
          )}
          {currentView === 'platforms' && (
            <PlatformsView
              onNext={() => setCurrentView('process')}
              onBack={() => setCurrentView('intro')}
            />
          )}
          {currentView === 'process' && (
            <ProcessView
              onGetStarted={onGetStarted}
              onBack={() => setCurrentView('platforms')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function IntroView({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
          <Rocket size={40} className="text-blue-600" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3">
          Deploy in Minutes, Not Hours
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Cauldron2Code automates the entire deployment process. Go from generated
          scaffold to live application without leaving your browser.
        </p>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Zap className="text-yellow-600" size={24} />}
          title="Lightning Fast"
          description="Deploy your application in under 5 minutes with automated setup and configuration"
        />
        <FeatureCard
          icon={<Shield className="text-green-600" size={24} />}
          title="Secure & Safe"
          description="OAuth authentication and encrypted token storage keep your credentials protected"
        />
        <FeatureCard
          icon={<CheckCircle2 className="text-blue-600" size={24} />}
          title="Zero Config"
          description="Automatic framework detection and environment setup - just provide your API keys"
        />
      </div>

      {/* What Happens */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">
          What happens during deployment?
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>Creates a new project on your chosen platform</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>Uploads your generated application code</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>Configures environment variables and build settings</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>Triggers the build and deployment process</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>Provides you with a live URL to access your application</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Learn About Platforms
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function PlatformsView({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-center">
        Cauldron2Code supports three leading hosting platforms. Choose the one that
        best fits your application's needs.
      </p>

      <div className="space-y-4">
        {PLATFORM_BENEFITS.map((platform) => (
          <div
            key={platform.platform}
            className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{platform.icon}</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  {platform.platform}
                </h4>
                <p className="text-sm text-blue-600 font-medium mb-3">
                  Best for: {platform.bestFor}
                </p>
                <ul className="space-y-2">
                  {platform.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle2
                        size={16}
                        className="shrink-0 mt-0.5 text-green-600"
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          See How It Works
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ProcessView({
  onGetStarted,
  onBack,
}: {
  onGetStarted: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-center">
        The deployment process is simple and guided. Here's what to expect:
      </p>

      {/* Steps */}
      <div className="space-y-4">
        {DEPLOYMENT_STEPS.map((item, index) => (
          <div key={item.step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                {item.step}
              </div>
              {index < DEPLOYMENT_STEPS.length - 1 && (
                <div className="w-0.5 h-16 bg-blue-200 my-2" />
              )}
            </div>
            <div className="flex-1 pb-8">
              <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Time Estimate */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-900 font-medium">
          ⏱️ Total time: 3-5 minutes from start to live application
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onGetStarted}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Get Started
          <Rocket size={18} />
        </button>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
      <div className="mb-3">{icon}</div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
