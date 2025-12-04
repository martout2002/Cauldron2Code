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
      className="fixed bottom-4 left-0 right-0 flex justify-between px-4 max-w-7xl mx-auto z-20"
      aria-label="Wizard navigation"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="pixel-nav-button touch-target focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        style={{ gap: '0' }}
        aria-label="Go back to previous step"
        aria-disabled={!canGoBack}
        type="button"
      >
        <span className="pixel-button-text" style={{ fontSize: '1.25rem', color: '#CD853F' }}>Back</span>
        <img
          src="/broom_stick.png"
          alt=""
          style={{ width: 'auto', height: '64px', objectFit: 'contain' }}
          aria-hidden="true"
        />
      </button>

      {/* Next/Generate Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="pixel-nav-button touch-target focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        style={{ gap: '0' }}
        aria-label={isLastStep ? 'Generate project' : 'Go to next step'}
        aria-disabled={!canGoNext}
        type="button"
      >
        <span className="pixel-button-text" style={{ fontSize: '1.25rem', color: '#CD853F' }}>
          {showGenerate ? 'Generate' : 'Next'}
        </span>
        <img
          src={showGenerate ? '/cauldron.png' : '/ladle.png'}
          alt=""
          style={{ width: '64px', height: '64px' }}
          aria-hidden="true"
        />
      </button>
    </nav>
  );
}
