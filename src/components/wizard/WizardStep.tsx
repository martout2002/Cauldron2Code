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
      className={`wizard-step transition-all duration-300 ${
        isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
      aria-labelledby="step-title"
      aria-describedby="step-subtitle"
    >
      {/* Title */}
      <h1 
        id="step-title"
        className="font-[family-name:var(--font-pixelify)] text-[clamp(2.5rem,8vw,3.5rem)] font-bold text-white text-center mb-2 sm:mb-3 px-2"
        style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8)', letterSpacing: '0.05em' }}
      >
        {step.title}
      </h1>

      {/* Subtitle */}
      <p 
        id="step-subtitle"
        className="font-[family-name:var(--font-pixelify)] text-[clamp(1rem,3vw,1.5rem)] text-[#e0e0e0] text-center mb-4 sm:mb-6 md:mb-8 px-2 mx-auto max-w-2xl"
        style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)' }}
      >
        {step.subtitle}
      </p>

      {/* Dynamic Content based on step type */}
      <div 
        className="wizard-content max-w-4xl mx-auto px-2 sm:px-4"
        role="form"
        aria-label={`Step ${stepNumber} of ${totalSteps}: ${step.title}`}
      >
        {step.type === 'text-input' && (
          <PixelInput
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={handleUpdate}
            placeholder={step.placeholder}
            icon="none"
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
