'use client';

import { StepConfig } from '@/lib/wizard/wizard-steps';
import { ScaffoldConfig } from '@/types';
import { PixelInput } from './PixelInput';
import { OptionGrid } from './OptionGrid';
import { CheckboxGroup } from './CheckboxGroup';

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
  // Get the current value for this step's field
  const currentValue = config[step.field];

  // Handle updates for different field types
  const handleUpdate = (value: any) => {
    onUpdate({ [step.field]: value });
  };

  // Handle extras field specially (it's an object, not a simple value)
  const handleExtrasUpdate = (selected: string[]) => {
    const extrasObj = {
      docker: selected.includes('docker'),
      githubActions: selected.includes('githubActions'),
      redis: selected.includes('redis'),
      prettier: selected.includes('prettier'),
      husky: selected.includes('husky'),
    };
    onUpdate({ extras: extrasObj });
  };

  // Convert extras object to array for CheckboxGroup
  const getExtrasArray = (): string[] => {
    if (!config.extras || typeof config.extras !== 'object') return [];
    return Object.entries(config.extras)
      .filter(([_, value]) => value === true)
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
            options={step.options}
            selected={currentValue as string | string[]}
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

        {/* Custom handling for extras field */}
        {step.type === 'custom' && step.field === 'extras' && step.options && (
          <CheckboxGroup
            options={step.options}
            selected={getExtrasArray()}
            onChange={handleExtrasUpdate}
            columns={step.columns || 2}
            label={step.title}
          />
        )}
      </div>
    </section>
  );
}
