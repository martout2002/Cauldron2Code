'use client';

interface NavigationControlsProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  currentStepId?: string;
}

export function NavigationControls({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isLastStep,
  currentStepId,
}: NavigationControlsProps) {
  // On summary step, show "Next" instead of "Generate"
  // On github-auth step, show "Generate" to proceed with OAuth
  const showGenerate = isLastStep && currentStepId !== 'summary';
  return (
    <nav 
      className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-0 right-0 flex justify-between px-4 sm:px-6 md:px-8 max-w-7xl mx-auto z-20"
      aria-label="Wizard navigation"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="pixel-nav-button touch-target focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label="Go back to previous step"
        aria-disabled={!canGoBack}
        type="button"
      >
        <img
          src="/broom_stick.png"
          alt=""
          className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16"
          aria-hidden="true"
        />
        <span className="pixel-button-text">Back</span>
      </button>

      {/* Next/Generate Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="pixel-nav-button touch-target focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label={isLastStep ? 'Generate project' : 'Go to next step'}
        aria-disabled={!canGoNext}
        type="button"
      >
        <img
          src={showGenerate ? '/cauldron.png' : '/ladle.png'}
          alt=""
          className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16"
          aria-hidden="true"
        />
        <span className="pixel-button-text">
          {showGenerate ? 'Generate' : 'Next'}
        </span>
      </button>
    </nav>
  );
}
