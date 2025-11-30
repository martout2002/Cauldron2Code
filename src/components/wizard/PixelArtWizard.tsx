'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWizardStore } from '@/lib/wizard/wizard-state';
import { useConfigStore } from '@/lib/store/config-store';
import { 
  getWizardSteps, 
  getVisibleSteps, 
  getNextVisibleStepIndex, 
  getPreviousVisibleStepIndex,
  getVisibleStepIndex 
} from '@/lib/wizard/wizard-steps';
import { validateStep } from '@/lib/wizard/wizard-validation';
import { preloadCriticalAssets, preloadNextStep } from '@/lib/wizard/asset-preloader';
import { WizardBackground } from './WizardBackground';
import { WizardStep } from './WizardStep';
import { NavigationControls } from './NavigationControls';
import { PersistenceIndicator } from './PersistenceIndicator';
import { CauldronAsset } from './CauldronAsset';
import { PixelProgressBar } from './PixelProgressBar';

interface PixelArtWizardProps {
  onGenerate?: () => void;
}

export function PixelArtWizard({ onGenerate }: PixelArtWizardProps) {
  // Wizard state
  const {
    currentStep,
    goToStep,
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
  const visibleSteps = getVisibleSteps(config);
  const currentStepConfig = steps[currentStep];
  
  // Calculate visible step number and total visible steps for display
  const currentVisibleStepIndex = getVisibleStepIndex(currentStep, config);
  const totalVisibleSteps = visibleSteps.length;
  const displayStepNumber = currentVisibleStepIndex + 1;

  // Wait for hydration before rendering
  const shouldBeReady = wizardHydrated && configHydrated;
  useEffect(() => {
    setIsReady(shouldBeReady);
  }, [shouldBeReady]);

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
      const debugMode = params.get('debug') === 'true';
      setShowDebugInfo(debugMode);
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
   * Animate selected option flying into the cauldron with an arc trajectory
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
      
      // Calculate arc control point (peak of the arc)
      const midX = (startX + endX) / 2;
      const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      const arcHeight = Math.min(distance * 0.4, 200); // Arc height based on distance
      const midY = Math.min(startY, endY) - arcHeight; // Peak above both points
      
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
      
      // Create keyframes for parabolic arc motion
      const duration = 1000;
      const frames = 60;
      const keyframes: Keyframe[] = [];
      
      for (let i = 0; i <= frames; i++) {
        const progress = i / frames;
        
        // Use ease-in for gravity effect (accelerates as it falls)
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress // Ease out in first half (going up)
          : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Ease in second half (falling down)
        
        // Quadratic bezier curve for the arc path
        const t = progress;
        const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * midX + Math.pow(t, 2) * endX;
        const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * midY + Math.pow(t, 2) * endY;
        
        // Scale down and fade out as it approaches the cauldron
        const scale = 1 - (easeProgress * 0.8); // Scale from 1 to 0.2
        const opacity = 1 - (easeProgress * 0.7); // Fade out gradually
        
        keyframes.push({
          left: `${x}px`,
          top: `${y}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity: opacity,
          offset: progress
        });
      }
      
      // Animate using Web Animations API with custom keyframes
      const animation = clone.animate(keyframes, {
        duration: duration,
        easing: 'linear' // Linear because easing is built into keyframes
      });
      
      // Clean up and resolve when animation completes
      animation.onfinish = () => {
        clone.remove();
        resolve();
      };
    });
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

    // Get next visible step
    const nextStepIndex = getNextVisibleStepIndex(currentStep, config);
    
    // Check if this is the last visible step
    if (nextStepIndex === -1) {
      // Trigger generation
      if (onGenerate) {
        onGenerate();
      }
      return;
    }

    // Set transitioning state IMMEDIATELY to prevent spam clicking
    setIsTransitioning(true);
    setIsAnimating(true);

    // Check if user prefers reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

    // Try to trigger flying animation for option-grid steps (if not reduced motion)
    if (!prefersReducedMotion && currentStepConfig?.type === 'option-grid') {
      try {
        // Find the selected option element
        const selectedValue = config[currentStepConfig.field as keyof typeof config];
        
        if (selectedValue && typeof selectedValue === 'string') {
          // Find all option cards and the selected one
          const allCards = document.querySelectorAll('.wizard-option') as NodeListOf<HTMLElement>;
          const selectedCard = document.querySelector('.wizard-option.selected') as HTMLElement;
          const selectedIcon = selectedCard?.querySelector('img') as HTMLElement;
          const cauldronImg = document.querySelector('.cauldron-asset') as HTMLElement;
          
          
          if (selectedIcon && cauldronImg && allCards.length > 0) {
            
            // Step 1: Fade out only unselected options quickly
            allCards.forEach(card => {
              if (card !== selectedCard) {
                card.style.transition = 'opacity 0.2s ease';
                card.style.opacity = '0';
              }
            });
            
            // Wait briefly for unselected to fade
            await new Promise((resolve) => setTimeout(resolve, 150));
            
            // Step 2: Start flying animation while selected is still visible
            // The animateOptionToCauldron creates a clone, so we hide the original as animation starts
            const animationPromise = animateOptionToCauldron(selectedIcon, cauldronImg);
            
            // Hide the original selected card immediately after clone is created
            setTimeout(() => {
              if (selectedCard) {
                selectedCard.style.opacity = '0';
              }
            }, 50);
            
            await animationPromise;
            
            // Clean up inline styles after animation completes
            allCards.forEach(card => {
              card.style.transition = '';
              card.style.opacity = '';
            });
            
            // Small delay before transitioning
            await new Promise((resolve) => setTimeout(resolve, 100));
          } else {
            console.log('❌ Missing elements for animation', {
              hasCards: allCards.length > 0,
              hasCard: !!selectedCard,
              hasIcon: !!selectedIcon,
              hasCauldron: !!cauldronImg
            });
          }
        }
      } catch (error) {
        // If animation fails, continue with normal transition
        console.warn('Flying animation failed:', error);
      }
    }

    // Wait for fade-out animation
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Move to next visible step
    goToStep(nextStepIndex);

    // Wait a bit before fade-in
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Fade in new step
    setIsAnimating(false);
    setIsTransitioning(false);

    // Clear validation error for new step
    setValidationError(null);

    // Announce step change to screen readers
    const nextVisibleIndex = getVisibleStepIndex(nextStepIndex, config);
    announceStepChange(nextVisibleIndex + 1, totalVisibleSteps);
  }, [
    currentStep,
    config,
    currentStepConfig,
    isTransitioning,
    goToStep,
    markStepComplete,
    onGenerate,
    animateOptionToCauldron,
    totalVisibleSteps,
  ]);

  // Handle back step navigation
  const handleBack = useCallback(async () => {
    if (isTransitioning || currentStep === 0) return;

    // Get previous visible step
    const prevStepIndex = getPreviousVisibleStepIndex(currentStep, config);
    
    // If no previous visible step, don't navigate
    if (prevStepIndex === -1) return;

    // Animate transition
    setIsTransitioning(true);
    setIsAnimating(true);

    // Wait for fade-out animation
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Move to previous visible step
    goToStep(prevStepIndex);

    // Wait a bit before fade-in
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Fade in previous step
    setIsAnimating(false);
    setIsTransitioning(false);

    // Clear validation error
    setValidationError(null);

    // Announce step change to screen readers
    const prevVisibleIndex = getVisibleStepIndex(prevStepIndex, config);
    announceStepChange(prevVisibleIndex + 1, totalVisibleSteps);
  }, [currentStep, config, isTransitioning, goToStep, totalVisibleSteps]);

  // Check if navigation is allowed
  const canGoBack = getPreviousVisibleStepIndex(currentStep, config) !== -1 && !isTransitioning;
  const canGoNext = !isTransitioning && !validationError;
  const isLastStep = getNextVisibleStepIndex(currentStep, config) === -1;

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
        className="relative z-10 min-h-screen px-2 sm:px-4 pt-8 sm:pt-12 pb-24 sm:pb-28"
        role="main"
        aria-label="Configuration wizard"
      >
        {/* Title and subtitle - fixed position, never animates */}
        <div className="flex flex-col items-center mb-4 sm:mb-6 md:mb-8">
          {currentStepConfig && (
            <>
              {/* Title - fixed height to prevent layout shift */}
              <h1 
                id="step-title"
                className="font-[family-name:var(--font-pixelify)] text-[clamp(2.5rem,8vw,3.5rem)] font-bold text-white text-center mb-2 sm:mb-3 px-2 min-h-16 sm:min-h-18 md:min-h-20 flex items-center justify-center"
                style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8)', letterSpacing: '0.05em' }}
              >
                {currentStepConfig.title}
              </h1>

              {/* Subtitle - fixed height to prevent layout shift */}
              <p 
                id="step-subtitle"
                className="font-[family-name:var(--font-pixelify)] text-[clamp(1rem,3vw,1.5rem)] text-[#e0e0e0] text-center px-2 mx-auto max-w-2xl min-h-12 sm:min-h-14 md:min-h-16 flex items-center justify-center"
                style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)' }}
              >
                {currentStepConfig.subtitle}
              </p>
            </>
          )}
        </div>

        {/* Current step content - only content animates, not title/subtitle */}
        <div className="flex flex-col items-center min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
          {currentStepConfig && (
            <WizardStep
              step={currentStepConfig}
              stepNumber={displayStepNumber}
              totalSteps={totalVisibleSteps}
              isAnimating={isAnimating}
              config={config}
              onUpdate={handleConfigUpdate}
              validationError={validationError}
            />
          )}
        </div>

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

      {/* Progress bar - shows current step */}
      <PixelProgressBar currentStep={currentVisibleStepIndex} totalSteps={totalVisibleSteps} />
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
