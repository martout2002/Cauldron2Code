'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWizardStore } from '@/lib/wizard/wizard-state';
import { useConfigStore } from '@/lib/store/config-store';
import { getWizardSteps } from '@/lib/wizard/wizard-steps';
import { validateStep } from '@/lib/wizard/wizard-validation';
import { preloadCriticalAssets, preloadNextStep } from '@/lib/wizard/asset-preloader';
import { WizardBackground } from './WizardBackground';
import { WizardStep } from './WizardStep';
import { NavigationControls } from './NavigationControls';
import { PersistenceIndicator } from './PersistenceIndicator';
import { CauldronAsset } from './CauldronAsset';

interface PixelArtWizardProps {
  onGenerate?: () => void;
}

export function PixelArtWizard({ onGenerate }: PixelArtWizardProps) {
  // Wizard state
  const {
    currentStep,
    totalSteps,
    nextStep,
    previousStep,
    isTransitioning,
    setIsTransitioning,
    markStepComplete,
    _hasHydrated: wizardHydrated,
  } = useWizardStore();

  // Configuration state
  const { config, updateConfig, _hasHydrated: configHydrated } = useConfigStore();

  // Local state for animations and validation
  const [isAnimating, setIsAnimating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Get wizard steps configuration
  const steps = getWizardSteps();
  const currentStepConfig = steps[currentStep];

  // Wait for hydration before rendering
  useEffect(() => {
    if (wizardHydrated && configHydrated) {
      setIsReady(true);
    }
  }, [wizardHydrated, configHydrated]);

  // Preload critical assets on mount
  useEffect(() => {
    if (isReady) {
      preloadCriticalAssets().catch(err => {
        console.warn('Failed to preload critical assets:', err);
      });
    }
  }, [isReady]);

  // Preload next step assets when current step changes
  useEffect(() => {
    if (isReady && !isTransitioning) {
      preloadNextStep(currentStep).catch(err => {
        console.warn('Failed to preload next step assets:', err);
      });
    }
  }, [currentStep, isReady, isTransitioning]);

  // Persist configuration after each update to ensure data is saved
  useEffect(() => {
    if (!isReady) return;
    
    // Configuration is automatically persisted by Zustand persist middleware
    // This effect ensures we're aware of the persistence happening
    // and can add additional logic if needed (e.g., analytics, logging)
  }, [config, isReady]);

  // Check for debug mode via URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setShowDebugInfo(params.get('debug') === 'true');
    }
  }, []);

  // Validate current step whenever config changes (with debouncing for text inputs)
  useEffect(() => {
    if (!currentStepConfig || !isReady) return;

    // For text input steps, validation is already debounced in PixelInput
    // For other steps, validate immediately
    const isTextInputStep = currentStepConfig.type === 'text-input';
    
    const validateCurrentStep = () => {
      const result = validateStep(currentStep, config);
      if (result.isValid) {
        setValidationError(null);
      } else {
        setValidationError(result.error || null);
      }
    };

    if (isTextInputStep) {
      // Debounce validation for text inputs to avoid excessive re-renders
      const timeoutId = setTimeout(validateCurrentStep, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // Immediate validation for selection steps
      validateCurrentStep();
    }
  }, [currentStep, config, currentStepConfig, isReady]);

  // Handle configuration updates
  const handleConfigUpdate = useCallback(
    (updates: Partial<typeof config>) => {
      updateConfig(updates);
    },
    [updateConfig]
  );

  /**
   * Animate selected option flying into the cauldron
   */
  const animateOptionToCauldron = useCallback(async (
    optionElement: HTMLElement,
    cauldronElement: HTMLElement
  ): Promise<void> => {
    return new Promise((resolve) => {
      // Get positions
      const optionRect = optionElement.getBoundingClientRect();
      const cauldronRect = cauldronElement.getBoundingClientRect();
      
      // Calculate trajectory from option center to cauldron center
      const startX = optionRect.left + optionRect.width / 2;
      const startY = optionRect.top + optionRect.height / 2;
      const endX = cauldronRect.left + cauldronRect.width / 2;
      const endY = cauldronRect.top + cauldronRect.height / 2;
      
      // Clone the selected option element
      const clone = optionElement.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.left = `${startX}px`;
      clone.style.top = `${startY}px`;
      clone.style.width = `${optionRect.width}px`;
      clone.style.height = `${optionRect.height}px`;
      clone.style.transform = 'translate(-50%, -50%)';
      clone.style.zIndex = '9999';
      clone.style.pointerEvents = 'none';
      clone.style.margin = '0';
      document.body.appendChild(clone);
      
      // Animate using Web Animations API
      const animation = clone.animate([
        {
          left: `${startX}px`,
          top: `${startY}px`,
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1
        },
        {
          left: `${endX}px`,
          top: `${endY}px`,
          transform: 'translate(-50%, -50%) scale(0.2)',
          opacity: 0
        }
      ], {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      });
      
      // Clean up and resolve when animation completes
      animation.onfinish = () => {
        clone.remove();
        resolve();
      };
    });
  }, []);

  /**
   * Trigger cauldron splash effect
   */
  const triggerCauldronSplash = useCallback((cauldronElement: HTMLElement) => {
    // Add splash effect class
    cauldronElement.classList.add('cauldron-splash');
    
    // Remove splash effect after animation completes
    setTimeout(() => {
      cauldronElement.classList.remove('cauldron-splash');
    }, 500);
  }, []);

  // Handle next step navigation
  const handleNext = useCallback(async () => {
    if (isTransitioning) return;

    // Validate current step
    const result = validateStep(currentStep, config);
    if (!result.isValid) {
      const errorMsg = result.error || 'Please complete this step';
      setValidationError(errorMsg);
      announceValidationError(errorMsg);
      return;
    }

    // Mark step as complete
    markStepComplete(currentStep);

    // Check if this is the last step
    if (currentStep === totalSteps - 1) {
      // Trigger generation
      if (onGenerate) {
        onGenerate();
      }
      return;
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

    // Try to trigger flying animation for option-grid steps (if not reduced motion)
    if (!prefersReducedMotion && currentStepConfig?.type === 'option-grid') {
      try {
        // Find the selected option element
        const selectedValue = config[currentStepConfig.field as keyof typeof config];
        console.log('🎯 Flying animation check:', { selectedValue, field: currentStepConfig.field });
        
        if (selectedValue && typeof selectedValue === 'string') {
          // Find the selected option card by looking for the selected class
          const selectedCard = document.querySelector('.pixel-option-card.selected') as HTMLElement;
          const cauldronImg = document.querySelector('.cauldron-asset') as HTMLElement;
          
          console.log('🎯 Elements found:', { 
            selectedCard: !!selectedCard, 
            cauldronImg: !!cauldronImg,
            selectedCardClasses: selectedCard?.className,
            cauldronClasses: cauldronImg?.className
          });
          
          if (selectedCard && cauldronImg) {
            console.log('🚀 Starting flying animation...');
            // Trigger flying animation
            await animateOptionToCauldron(selectedCard, cauldronImg);
            
            // Trigger cauldron splash effect
            triggerCauldronSplash(cauldronImg);
            
            // Small delay after splash before transitioning
            await new Promise((resolve) => setTimeout(resolve, 100));
            console.log('✅ Flying animation complete');
          } else {
            console.log('❌ Missing elements for animation');
          }
        }
      } catch (error) {
        // If animation fails, continue with normal transition
        console.warn('Flying animation failed:', error);
      }
    }

    // Animate transition
    setIsTransitioning(true);
    setIsAnimating(true);

    // Wait for fade-out animation
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Move to next step
    nextStep();

    // Wait a bit before fade-in
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Fade in new step
    setIsAnimating(false);
    setIsTransitioning(false);

    // Clear validation error for new step
    setValidationError(null);

    // Announce step change to screen readers
    announceStepChange(currentStep + 2, totalSteps);
  }, [
    currentStep,
    totalSteps,
    config,
    currentStepConfig,
    isTransitioning,
    nextStep,
    markStepComplete,
    onGenerate,
    animateOptionToCauldron,
    triggerCauldronSplash,
  ]);

  // Handle back step navigation
  const handleBack = useCallback(async () => {
    if (isTransitioning || currentStep === 0) return;

    // Animate transition
    setIsTransitioning(true);
    setIsAnimating(true);

    // Wait for fade-out animation
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Move to previous step
    previousStep();

    // Wait a bit before fade-in
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Fade in previous step
    setIsAnimating(false);
    setIsTransitioning(false);

    // Clear validation error
    setValidationError(null);

    // Announce step change to screen readers
    announceStepChange(currentStep, totalSteps);
  }, [currentStep, totalSteps, isTransitioning, previousStep]);

  // Check if navigation is allowed
  const canGoBack = currentStep > 0 && !isTransitioning;
  const canGoNext = !isTransitioning && !validationError;
  const isLastStep = currentStep === totalSteps - 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          if (canGoNext) {
            e.preventDefault();
            handleNext();
          }
          break;
        case 'ArrowLeft':
          if (canGoBack) {
            e.preventDefault();
            handleBack();
          }
          break;
        case 'Escape':
          if (canGoBack) {
            e.preventDefault();
            handleBack();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handleBack, canGoNext, canGoBack]);

  // Show loading state during hydration
  if (!isReady) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <WizardBackground />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="pixel-subtitle">Loading your magical workshop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layer */}
      <WizardBackground />

      {/* Fixed Cauldron - always visible, not affected by content */}
      <CauldronAsset />

      {/* Main content */}
      <main 
        className="relative z-10 flex flex-col items-center justify-start min-h-screen px-2 sm:px-4 pt-8 sm:pt-12 pb-24 sm:pb-28"
        role="main"
        aria-label="Configuration wizard"
      >
        {/* Current step content */}
        {currentStepConfig && (
          <WizardStep
            step={currentStepConfig}
            stepNumber={currentStep + 1}
            totalSteps={totalSteps}
            isAnimating={isAnimating}
            config={config}
            onUpdate={handleConfigUpdate}
            validationError={validationError}
          />
        )}

        {/* Navigation controls */}
        <NavigationControls
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          isLastStep={isLastStep}
        />

      </main>

      {/* Persistence indicator (shows "Saved" briefly after changes) */}
      <PersistenceIndicator showDebugInfo={showDebugInfo} />
    </div>
  );
}

/**
 * Announce step changes to screen readers
 */
function announceStepChange(step: number, total: number) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = `Navigated to step ${step} of ${total}`;
  document.body.appendChild(announcement);
  setTimeout(() => {
    if (announcement.parentNode) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Announce validation errors to screen readers
 */
function announceValidationError(error: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'alert');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = `Error: ${error}`;
  document.body.appendChild(announcement);
  setTimeout(() => {
    if (announcement.parentNode) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}
