'use client';

import { useEffect } from 'react';
import { StepConfig } from '@/lib/wizard/wizard-steps';
import { ScaffoldConfig } from '@/types';
import { PixelInput } from './PixelInput';
import { OptionGrid } from './OptionGrid';
import { CheckboxGroup } from './CheckboxGroup';
import { SummaryStep } from './SummaryStep';
import { GitHubAuthStep } from './GitHubAuthStep';
import { useCompatibility } from '@/lib/wizard/useCompatibility';

interface WizardStepProps {
  step: StepConfig;
  stepNumber: number;
  totalSteps: number;
  isAnimating: boolean;
  config: ScaffoldConfig;
  onUpdate: (updates: Partial<ScaffoldConfig>) => void;
  validationError?: string | null;
}

export function WizardStep({
  step,
  stepNumber,
  totalSteps,
  isAnimating,
  config,
  onUpdate,
  validationError,
}: WizardStepProps) {
  // Get compatibility checking functions - Requirements: 1.3, 8.4, 8.5
  const { getCompatibleOptions } = useCompatibility();
  
  // Get the current value for this step's field
  const currentValue = config[step.field];
  
  // Check if this step should be rendered based on conditional
  // Requirements: 2.1, 2.4 - conditional step rendering
  const shouldRender = !step.conditional || step.conditional(config);
  
  // Evaluate compatibility when step loads or config changes
  // Requirements: 1.3, 8.4
  useEffect(() => {
    // Only evaluate for option-grid steps that should be rendered
    if (shouldRender && step.type === 'option-grid' && step.options) {
      // Use requestAnimationFrame to ensure non-blocking evaluation
      // Requirement: 8.5 - non-blocking step transitions
      requestAnimationFrame(() => {
        // Trigger compatibility evaluation by calling getCompatibleOptions
        // This will precompute compatibility for all options in this step
        getCompatibleOptions(step.id, step.options || []);
      });
    }
  }, [step.id, step.type, step.options, getCompatibleOptions, shouldRender]);
  
  // If step should not be rendered, return null
  // This handles the case where a step becomes conditional after being displayed
  if (!shouldRender) {
    return null;
  }

  // Handle updates for different field types
  const handleUpdate = (value: string | string[]) => {
    // Special handling for extras field (convert array to object)
    if (step.field === 'extras' && Array.isArray(value)) {
      const extrasObj = {
        docker: value.includes('docker'),
        githubActions: value.includes('githubActions'),
        redis: value.includes('redis'),
        prettier: value.includes('prettier'),
        husky: value.includes('husky'),
      };
      onUpdate({ extras: extrasObj });
    } else {
      onUpdate({ [step.field]: value });
    }
  };

  // Convert extras object to array for OptionGrid with multiSelect
  const getExtrasArray = (): string[] => {
    if (!config.extras || typeof config.extras !== 'object') return [];
    return Object.entries(config.extras)
      .filter(([, value]) => value === true)
      .map(([key]) => key);
  };

  return (
    <section
      className={`wizard-step transition-opacity duration-300 w-full ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}
      aria-labelledby="step-title"
      aria-describedby="step-subtitle"
    >
      {/* Dynamic Content based on step type - with min-height to prevent layout shift */}
      <div 
        className="wizard-content max-w-4xl mx-auto px-2 sm:px-4 min-h-[300px] sm:min-h-[350px] md:min-h-[400px]"
        role="form"
        aria-label={`Step ${stepNumber} of ${totalSteps}: ${step.title}`}
      >
        {step.type === 'text-input' && (
          <PixelInput
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={handleUpdate}
            placeholder={step.placeholder}
            error={validationError || undefined}
            label={step.title}
          />
        )}

        {step.type === 'option-grid' && step.options && (
          <OptionGrid
            options={getCompatibleOptions(step.id, step.options)}
            selected={step.field === 'extras' ? getExtrasArray() : (currentValue as string | string[])}
            onSelect={handleUpdate}
            columns={step.columns || 3}
            multiSelect={step.multiSelect || false}
            label={step.title}
          />
        )}

        {step.type === 'checkbox-group' && step.options && (
          <CheckboxGroup
            options={step.options}
            selected={Array.isArray(currentValue) ? currentValue : []}
            onChange={handleUpdate}
            columns={step.columns || 2}
            label={step.title}
          />
        )}

        {step.type === 'custom' && step.id === 'summary' && (
          <SummaryStep config={config} />
        )}

        {step.type === 'custom' && step.id === 'github-auth' && (
          <GitHubAuthStep />
        )}
      </div>
    </section>
  );
}
