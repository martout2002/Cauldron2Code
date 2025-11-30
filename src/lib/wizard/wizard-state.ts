import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Wizard-specific state for managing the multi-step configuration flow
 */
interface WizardState {
  // Current step index (0-based)
  currentStep: number;
  
  // Total number of steps in the wizard
  totalSteps: number;
  
  // Set of completed step indices
  completedSteps: Set<number>;
  
  // Step-specific data (for temporary state not yet committed to config)
  stepData: Record<number, any>;
  
  // Animation/transition state
  isTransitioning: boolean;
  
  // Navigation functions
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  
  // Data management
  updateStepData: (step: number, data: any) => void;
  clearStepData: (step: number) => void;
  
  // Transition control
  setIsTransitioning: (isTransitioning: boolean) => void;
  
  // Completion tracking
  markStepComplete: (step: number) => void;
  isStepComplete: (step: number) => boolean;
  
  // Reset wizard state
  resetWizard: () => void;
  
  // Hydration tracking
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const TOTAL_WIZARD_STEPS = 10; // Updated to include AI templates and AI provider steps

/**
 * Zustand store for wizard state management
 * Persists to localStorage to maintain state across page reloads
 */
export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      totalSteps: TOTAL_WIZARD_STEPS,
      completedSteps: new Set<number>(),
      stepData: {},
      isTransitioning: false,
      _hasHydrated: false,
      
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      
      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps - 1) {
          set({
            currentStep: currentStep + 1,
          });
        }
      },
      
      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({
            currentStep: currentStep - 1,
          });
        }
      },
      
      goToStep: (step: number) => {
        const { totalSteps } = get();
        if (step >= 0 && step < totalSteps) {
          set({
            currentStep: step,
          });
        }
      },
      
      updateStepData: (step: number, data: any) => {
        set((state) => ({
          stepData: {
            ...state.stepData,
            [step]: data,
          },
        }));
      },
      
      clearStepData: (step: number) => {
        set((state) => {
          const newStepData = { ...state.stepData };
          delete newStepData[step];
          return { stepData: newStepData };
        });
      },
      
      setIsTransitioning: (isTransitioning: boolean) => {
        set({ isTransitioning });
      },
      
      markStepComplete: (step: number) => {
        set((state) => ({
          completedSteps: new Set([...state.completedSteps, step]),
        }));
      },
      
      isStepComplete: (step: number) => {
        return get().completedSteps.has(step);
      },
      
      resetWizard: () => {
        set({
          currentStep: 0,
          completedSteps: new Set<number>(),
          stepData: {},
          isTransitioning: false,
        });
      },
    }),
    {
      name: 'cauldron2code-wizard',
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      // Custom serialization for Set
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps),
        stepData: state.stepData,
      }),
      // Custom deserialization for Set
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        completedSteps: new Set(persistedState?.completedSteps || []),
      }),
    }
  )
);
