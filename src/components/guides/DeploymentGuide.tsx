'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Rocket } from 'lucide-react';
import { GuideStep } from './GuideStep';
import { GuideProgress } from './GuideProgress';
import { ViewModeToggle } from './ViewModeToggle';
import { ChecklistSection } from './ChecklistSection';
import { TroubleshootingSection } from './TroubleshootingSection';
import { GuideExport } from './GuideExport';
import { SkipLink } from './SkipLink';
import { getGuideProgressManager } from '@/lib/deployment/guide-progress-manager';
import type { DeploymentGuide as DeploymentGuideType } from '@/types/deployment-guides';

interface DeploymentGuideProps {
  guide: DeploymentGuideType;
}

export function DeploymentGuide({ guide }: DeploymentGuideProps) {
  const [viewMode, setViewMode] = useState<'quick-start' | 'detailed'>('detailed');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [completedChecklistItems, setCompletedChecklistItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const progressManager = getGuideProgressManager();

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = () => {
      try {
        const savedProgress = progressManager.loadProgress(guide.id);
        
        if (savedProgress) {
          setCompletedSteps(savedProgress.completedSteps);
          setCompletedChecklistItems(savedProgress.completedChecklistItems);
          setViewMode(savedProgress.viewMode);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [guide.id, progressManager]);

  // Handle view mode change
  const handleViewModeChange = (mode: 'quick-start' | 'detailed') => {
    setViewMode(mode);
    progressManager.setViewMode(guide.id, mode);
  };

  // Handle step completion toggle
  const handleToggleStep = (stepId: string) => {
    const isCompleted = completedSteps.includes(stepId);
    const newCompleted = isCompleted
      ? completedSteps.filter(id => id !== stepId)
      : [...completedSteps, stepId];
    
    setCompletedSteps(newCompleted);
    progressManager.markStepComplete(guide.id, stepId, !isCompleted);
  };

  // Handle checklist item completion toggle
  const handleToggleChecklistItem = (itemId: string) => {
    const isCompleted = completedChecklistItems.includes(itemId);
    const newCompleted = isCompleted
      ? completedChecklistItems.filter(id => id !== itemId)
      : [...completedChecklistItems, itemId];
    
    setCompletedChecklistItems(newCompleted);
    progressManager.markChecklistItemComplete(guide.id, itemId, !isCompleted);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b4ff64] mx-auto mb-4"></div>
          <p className="font-[family-name:var(--font-pixelify)] text-gray-300">Loading deployment guide...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Skip Links for Accessibility */}
      <SkipLink targetId="deployment-steps" label="Skip to deployment steps" />
      <SkipLink targetId="post-deployment-checklist" label="Skip to post-deployment checklist" />
      <SkipLink targetId="troubleshooting" label="Skip to troubleshooting" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8" role="banner">
        {/* Platform Logo and Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[rgba(20,20,30,0.8)] border-3 border-[#8fcc4f] flex items-center justify-center">
            <Image
              src={guide.platform.logo}
              alt={`${guide.platform.name} logo`}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-pixelify)] text-white text-shadow-[4px_4px_0px_rgba(0,0,0,0.8)]">
              Deploy to {guide.platform.name}
            </h1>
            <p className="font-[family-name:var(--font-pixelify)] text-gray-300 mt-1">
              {guide.platform.description}
            </p>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* View Mode Toggle */}
            <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />

            {/* Estimated Time */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(139,92,246,0.2)] border-2 border-[#8b5cf6] rounded-lg shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <Clock size={18} className="text-[#8b5cf6]" />
              <span className="text-sm font-semibold font-[family-name:var(--font-pixelify)] text-white">
                Estimated time: {guide.estimatedTime}
              </span>
            </div>
          </div>

          {/* Export Controls */}
          <div className="no-print">
            <GuideExport guide={guide} />
          </div>
        </div>

        {/* Progress Indicator */}
        <GuideProgress
          completed={completedSteps.length}
          total={guide.steps.length}
        />
      </header>

      {/* Introduction */}
      <div className="mb-8 p-6 bg-[rgba(20,20,30,0.8)] border-3 border-[#b4ff64] rounded-xl shadow-[0_0_20px_rgba(180,255,100,0.3)]">
        <div className="flex items-start gap-3">
          <Rocket size={24} className="text-[#b4ff64] shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-bold font-[family-name:var(--font-pixelify)] text-white mb-2">
              Let's get your project deployed!
            </h2>
            <p className="text-sm font-[family-name:var(--font-pixelify)] text-gray-300">
              Follow these step-by-step instructions to deploy your application to {guide.platform.name}.
              {viewMode === 'quick-start' 
                ? ' Quick Start mode shows only essential commands. Click "Learn more" on any step to see detailed explanations.'
                : ' Detailed mode includes full explanations, tips, and troubleshooting information.'}
            </p>
          </div>
        </div>
      </div>

      {/* Deployment Steps */}
      <section 
        id="deployment-steps" 
        className="mb-12 scroll-mt-8" 
        aria-labelledby="deployment-steps-heading"
        tabIndex={-1}
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-[#8b5cf6] via-[#b4ff64] to-[#f97316] rounded-full" aria-hidden="true" />
          <h2 
            id="deployment-steps-heading" 
            className="text-2xl font-bold font-[family-name:var(--font-pixelify)] text-white"
          >
            Deployment Steps
          </h2>
        </div>
        <div className="space-y-4" role="list" aria-label="Deployment steps">
          {guide.steps.map((step) => (
            <GuideStep
              key={step.id}
              step={step}
              completed={completedSteps.includes(step.id)}
              viewMode={viewMode}
              onToggleComplete={() => handleToggleStep(step.id)}
              guideId={guide.id}
            />
          ))}
        </div>
      </section>

      {/* Post-Deployment Checklist */}
      {guide.postDeploymentChecklist && guide.postDeploymentChecklist.length > 0 && (
        <section 
          id="post-deployment-checklist" 
          className="mb-12 scroll-mt-8" 
          aria-labelledby="checklist-heading"
          tabIndex={-1}
        >
          <ChecklistSection
            items={guide.postDeploymentChecklist}
            completedItems={completedChecklistItems}
            onToggleItem={handleToggleChecklistItem}
          />
        </section>
      )}

      {/* Troubleshooting Section */}
      {guide.troubleshooting && (
        <section 
          id="troubleshooting" 
          className="mb-12 scroll-mt-8" 
          aria-labelledby="troubleshooting-heading"
          tabIndex={-1}
        >
          <TroubleshootingSection troubleshooting={guide.troubleshooting} />
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t-2 border-[#8b5cf6]" role="contentinfo">
        <div className="text-center">
          <p className="text-sm font-[family-name:var(--font-pixelify)] text-gray-300 mb-4">
            Need more help? Check out the{' '}
            <a
              href={guide.platform.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8b5cf6] hover:text-[#b4ff64] transition-colors focus:outline-none focus:ring-2 focus:ring-[#b4ff64] focus:ring-offset-2 rounded"
              aria-label={`Open ${guide.platform.name} documentation in new tab`}
            >
              {guide.platform.name} documentation
            </a>
            {' '}or visit their{' '}
            <a
              href={guide.troubleshooting.platformStatusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8b5cf6] hover:text-[#b4ff64] transition-colors focus:outline-none focus:ring-2 focus:ring-[#b4ff64] focus:ring-offset-2 rounded"
              aria-label="Check platform status in new tab"
            >
              status page
            </a>
            .
          </p>
          <p className="text-xs font-[family-name:var(--font-pixelify)] text-gray-400">
            Your progress is automatically saved in your browser.
          </p>
        </div>
      </footer>
      </div>
    </>
  );
}
