# Design Document

## Overview

This design transforms the configuration wizard from a traditional form-based interface into an immersive pixel-art experience. The wizard presents configuration options as a series of themed "slides" or steps, each featuring the magical workshop background, a bubbling cauldron, and pixel-art styled controls. The design maintains all functionality of the original wizard while providing a game-like, engaging user experience that aligns with the pixel-art landing page aesthetic.

## Architecture

### Component Structure

The new wizard will be implemented as a multi-step component with the following hierarchy:

```
PixelArtWizard (Container)
├── WizardBackground (Full-screen background layer)
├── WizardStep (Current step content)
│   ├── StepTitle (e.g., "Naming your Spell")
│   ├── StepSubtitle (e.g., "Give your potion a name, young witch!")
│   ├── CauldronAsset (Centered decorative element)
│   ├── StepContent (Dynamic based on configuration type)
│   │   ├── TextInput (for project name, description)
│   │   ├── OptionGrid (for framework, database selection)
│   │   └── CheckboxGroup (for extras, deployment targets)
│   └── StepIndicator (Progress display)
├── NavigationControls
│   ├── BackButton (with broom icon)
│   └── NextButton (with ladle icon, or "Generate" on final step)
└── ValidationFeedback (Error/warning messages)
```

### File Structure

```
src/
├── app/
│   ├── configure/
│   │   └── page.tsx (New pixel-art wizard)
│   └── configure-old/
│       └── page.tsx (Preserved original wizard)
├── components/
│   ├── wizard/
│   │   ├── PixelArtWizard.tsx (Main wizard container)
│   │   ├── WizardStep.tsx (Individual step wrapper)
│   │   ├── WizardBackground.tsx (Background layer component)
│   │   ├── CauldronAsset.tsx (Animated cauldron)
│   │   ├── PixelInput.tsx (Styled input field)
│   │   ├── PixelButton.tsx (Reusable button component)
│   │   ├── OptionGrid.tsx (Grid for framework/tech selection)
│   │   ├── StepIndicator.tsx (Progress indicator)
│   │   └── NavigationControls.tsx (Back/Next buttons)
│   ├── ConfigurationWizard.tsx (Original - moved to configure-old)
│   └── ... (other existing components)
└── lib/
    └── wizard/
        ├── wizard-steps.ts (Step definitions and configuration)
        ├── wizard-state.ts (State management for wizard)
        └── wizard-validation.ts (Step-specific validation)
```

### State Management

The wizard will use the existing `useConfigStore` from Zustand but add wizard-specific state:

```typescript
interface WizardState {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  stepData: Record<number, any>;
  isTransitioning: boolean;
}

// Extend existing config store or create separate wizard store
const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  totalSteps: 8,
  completedSteps: new Set(),
  stepData: {},
  isTransitioning: false,
  
  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
    completedSteps: state.completedSteps.add(state.currentStep)
  })),
  
  previousStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 0)
  })),
  
  goToStep: (step: number) => set({ currentStep: step }),
  
  updateStepData: (step: number, data: any) => set((state) => ({
    stepData: { ...state.stepData, [step]: data }
  }))
}));
```

## Components and Interfaces

### PixelArtWizard Component

**File:** `src/components/wizard/PixelArtWizard.tsx`

**Purpose:** Main container that orchestrates the wizard flow

**Structure:**
```typescript
export function PixelArtWizard() {
  const { currentStep, nextStep, previousStep } = useWizardStore();
  const { config, updateConfig } = useConfigStore();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const steps = getWizardSteps(); // Defined in wizard-steps.ts
  const currentStepConfig = steps[currentStep];
  
  const handleNext = async () => {
    // Validate current step
    const isValid = await validateStep(currentStep, config);
    if (!isValid) return;
    
    // Animate transition
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    nextStep();
    setIsAnimating(false);
  };
  
  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      previousStep();
      setIsAnimating(false);
    }, 300);
  };
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <WizardBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <WizardStep
          step={currentStepConfig}
          isAnimating={isAnimating}
          config={config}
          onUpdate={updateConfig}
        />
        
        <NavigationControls
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={currentStep > 0}
          canGoNext={isStepValid(currentStep, config)}
          isLastStep={currentStep === steps.length - 1}
        />
        
        <StepIndicator
          current={currentStep + 1}
          total={steps.length}
        />
      </div>
    </div>
  );
}
```

### WizardStep Component

**File:** `src/components/wizard/WizardStep.tsx`

**Purpose:** Renders the content for each configuration step

**Structure:**
```typescript
interface WizardStepProps {
  step: StepConfig;
  isAnimating: boolean;
  config: ScaffoldConfig;
  onUpdate: (updates: Partial<ScaffoldConfig>) => void;
}

export function WizardStep({ step, isAnimating, config, onUpdate }: WizardStepProps) {
  return (
    <div className={`wizard-step ${isAnimating ? 'fade-out' : 'fade-in'}`}>
      {/* Title */}
      <h1 className="pixel-title text-center mb-2">
        {step.title}
      </h1>
      
      {/* Subtitle */}
      <p className="pixel-subtitle text-center mb-8">
        {step.subtitle}
      </p>
      
      {/* Cauldron Asset */}
      <CauldronAsset className="mb-8" />
      
      {/* Dynamic Content based on step type */}
      <div className="wizard-content max-w-2xl mx-auto">
        {step.type === 'text-input' && (
          <PixelInput
            value={config[step.field]}
            onChange={(value) => onUpdate({ [step.field]: value })}
            placeholder={step.placeholder}
            icon="search"
          />
        )}
        
        {step.type === 'option-grid' && (
          <OptionGrid
            options={step.options}
            selected={config[step.field]}
            onSelect={(value) => onUpdate({ [step.field]: value })}
            columns={step.columns || 3}
          />
        )}
        
        {step.type === 'checkbox-group' && (
          <CheckboxGroup
            options={step.options}
            selected={config[step.field]}
            onChange={(value) => onUpdate({ [step.field]: value })}
          />
        )}
      </div>
    </div>
  );
}
```

### PixelInput Component

**File:** `src/components/wizard/PixelInput.tsx`

**Purpose:** Styled input field with search bar aesthetic

**Structure:**
```typescript
interface PixelInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: 'search' | 'none';
}

export function PixelInput({ value, onChange, placeholder, icon = 'search' }: PixelInputProps) {
  return (
    <div className="pixel-input-wrapper relative">
      {/* Search bar background */}
      <div className="pixel-input-bg absolute inset-0" 
           style={{ backgroundImage: "url('/search_bar.png')" }} />
      
      {/* Icon */}
      {icon === 'search' && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <SearchIcon className="w-6 h-6 text-gray-600" />
        </div>
      )}
      
      {/* Input field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pixel-input relative z-10 w-full px-12 py-4 bg-transparent text-lg"
      />
    </div>
  );
}
```

### NavigationControls Component

**File:** `src/components/wizard/NavigationControls.tsx`

**Purpose:** Back and Next buttons with potion icons

**Structure:**
```typescript
interface NavigationControlsProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
}

export function NavigationControls({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isLastStep
}: NavigationControlsProps) {
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-between px-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="pixel-nav-button"
        aria-label="Go back"
      >
        <img src="/broom_stick.png" alt="" className="w-16 h-16" />
        <span className="pixel-button-text">Back</span>
      </button>
      
      {/* Next/Generate Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="pixel-nav-button"
        aria-label={isLastStep ? "Generate project" : "Go to next step"}
      >
        <img 
          src={isLastStep ? "/cauldron.png" : "/ladle.png"} 
          alt="" 
          className="w-16 h-16" 
        />
        <span className="pixel-button-text">
          {isLastStep ? 'Generate' : 'Next'}
        </span>
      </button>
    </div>
  );
}
```

### OptionGrid Component

**File:** `src/components/wizard/OptionGrid.tsx`

**Purpose:** Grid layout for selecting frameworks, databases, etc.

**Structure:**
```typescript
interface OptionGridProps {
  options: Array<{ value: string; label: string; icon?: string }>;
  selected: string | string[];
  onSelect: (value: string) => void;
  columns?: number;
  multiSelect?: boolean;
}

export function OptionGrid({
  options,
  selected,
  onSelect,
  columns = 3,
  multiSelect = false
}: OptionGridProps) {
  const isSelected = (value: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(value);
    }
    return selected === value;
  };
  
  return (
    <div 
      className={`grid gap-4`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`pixel-option-card ${isSelected(option.value) ? 'selected' : ''}`}
        >
          {option.icon && (
            <img src={option.icon} alt="" className="w-12 h-12 mb-2" />
          )}
          <span className="pixel-option-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
```

## Wizard Steps Configuration

**File:** `src/lib/wizard/wizard-steps.ts`

Define all wizard steps with their configuration:

```typescript
export interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  type: 'text-input' | 'option-grid' | 'checkbox-group' | 'custom';
  field: keyof ScaffoldConfig;
  options?: Array<{ value: string; label: string; icon?: string }>;
  placeholder?: string;
  columns?: number;
  validation?: (value: any) => boolean | string;
}

export function getWizardSteps(): StepConfig[] {
  return [
    // Step 1: Project Name
    {
      id: 'project-name',
      title: 'Naming your Spell',
      subtitle: 'Give your potion a name, young witch!',
      type: 'text-input',
      field: 'projectName',
      placeholder: 'my-awesome-project',
      validation: (value) => {
        if (!value) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Use lowercase letters, numbers, and hyphens only';
        return true;
      }
    },
    
    // Step 2: Project Description
    {
      id: 'description',
      title: 'Describe your Magic',
      subtitle: 'What enchantment will your potion create?',
      type: 'text-input',
      field: 'description',
      placeholder: 'A magical application that...'
    },
    
    // Step 3: Frontend Framework
    {
      id: 'frontend',
      title: 'Choose your Grimoire',
      subtitle: 'Select the ancient texts to guide your spell',
      type: 'option-grid',
      field: 'frontendFramework',
      columns: 3,
      options: [
        { value: 'nextjs', label: 'Next.js', icon: '/icons/nextjs.png' },
        { value: 'react', label: 'React', icon: '/icons/react.png' },
        { value: 'vue', label: 'Vue', icon: '/icons/vue.png' },
        { value: 'angular', label: 'Angular', icon: '/icons/angular.png' },
        { value: 'svelte', label: 'Svelte', icon: '/icons/svelte.png' }
      ]
    },
    
    // Step 4: Backend Framework
    {
      id: 'backend',
      title: 'Select your Cauldron',
      subtitle: 'Where will your potion brew?',
      type: 'option-grid',
      field: 'backendFramework',
      columns: 3,
      options: [
        { value: 'none', label: 'None', icon: '/icons/none.png' },
        { value: 'nextjs-api', label: 'Next.js API', icon: '/icons/nextjs.png' },
        { value: 'express', label: 'Express', icon: '/icons/express.png' },
        { value: 'fastify', label: 'Fastify', icon: '/icons/fastify.png' },
        { value: 'nestjs', label: 'NestJS', icon: '/icons/nestjs.png' }
      ]
    },
    
    // Step 5: Database
    {
      id: 'database',
      title: 'Choose your Spell Book',
      subtitle: 'Where will you store your magical knowledge?',
      type: 'option-grid',
      field: 'database',
      columns: 3,
      options: [
        { value: 'none', label: 'None' },
        { value: 'prisma-postgres', label: 'Prisma + PostgreSQL' },
        { value: 'drizzle-postgres', label: 'Drizzle + PostgreSQL' },
        { value: 'supabase', label: 'Supabase' },
        { value: 'mongodb', label: 'MongoDB' }
      ]
    },
    
    // Step 6: Authentication
    {
      id: 'auth',
      title: 'Guard your Potions',
      subtitle: 'Who may enter your magical workshop?',
      type: 'option-grid',
      field: 'auth',
      columns: 2,
      options: [
        { value: 'none', label: 'None' },
        { value: 'nextauth', label: 'NextAuth' },
        { value: 'supabase', label: 'Supabase Auth' },
        { value: 'clerk', label: 'Clerk' }
      ]
    },
    
    // Step 7: Styling
    {
      id: 'styling',
      title: 'Decorate your Workshop',
      subtitle: 'How will your magic appear?',
      type: 'option-grid',
      field: 'styling',
      columns: 3,
      options: [
        { value: 'tailwind', label: 'Tailwind CSS' },
        { value: 'css-modules', label: 'CSS Modules' },
        { value: 'styled-components', label: 'Styled Components' }
      ]
    },
    
    // Step 8: Extras & Deployment
    {
      id: 'extras',
      title: 'Final Ingredients',
      subtitle: 'Add the finishing touches to your spell',
      type: 'checkbox-group',
      field: 'extras',
      options: [
        { value: 'eslint', label: 'ESLint' },
        { value: 'prettier', label: 'Prettier' },
        { value: 'husky', label: 'Husky' },
        { value: 'docker', label: 'Docker' },
        { value: 'githubActions', label: 'GitHub Actions' }
      ]
    }
  ];
}
```

## Styling

### CSS Classes

**File:** `src/app/globals.css` (additions)

```css
/* Wizard Container */
.wizard-step {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.wizard-step.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.wizard-step.fade-out {
  opacity: 0;
  transform: translateY(-20px);
}

/* Pixel Title (reuse from landing page) */
.pixel-title {
  font-family: var(--font-pixelify);
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 700;
  color: #ffffff;
  text-shadow: 
    0 0 10px rgba(180, 255, 100, 0.5),
    0 0 20px rgba(180, 255, 100, 0.3),
    4px 4px 0px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.05em;
}

.pixel-subtitle {
  font-family: var(--font-pixelify);
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: #e0e0e0;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.8);
}

/* Pixel Input */
.pixel-input-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.pixel-input-bg {
  background-size: 100% 100%;
  background-repeat: no-repeat;
  pointer-events: none;
}

.pixel-input {
  font-family: var(--font-pixelify);
  font-size: 1.25rem;
  color: #2a2a2a;
  border: none;
  outline: none;
}

.pixel-input:focus {
  filter: drop-shadow(0 0 8px rgba(180, 255, 100, 0.6));
}

.pixel-input::placeholder {
  color: #888;
  opacity: 0.7;
}

/* Navigation Buttons */
.pixel-nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.pixel-nav-button:hover:not(:disabled) {
  transform: scale(1.1);
  filter: drop-shadow(0 0 12px rgba(180, 255, 100, 0.8));
}

.pixel-nav-button:active:not(:disabled) {
  transform: scale(0.95);
}

.pixel-nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pixel-button-text {
  font-family: var(--font-pixelify);
  font-size: 1.25rem;
  color: #ffffff;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.8);
}

/* Option Grid */
.pixel-option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(20, 20, 30, 0.8);
  border: 3px solid #4a4a5a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pixel-option-card:hover {
  border-color: #8fcc4f;
  background: rgba(30, 30, 40, 0.9);
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.pixel-option-card.selected {
  border-color: #b4ff64;
  background: rgba(180, 255, 100, 0.2);
  box-shadow: 
    0 0 20px rgba(180, 255, 100, 0.4),
    inset 0 0 20px rgba(180, 255, 100, 0.1);
}

.pixel-option-label {
  font-family: var(--font-pixelify);
  font-size: 1rem;
  color: #ffffff;
  text-align: center;
}

/* Step Indicator */
.step-indicator {
  position: fixed;
  top: 2rem;
  right: 2rem;
  font-family: var(--font-pixelify);
  font-size: 1rem;
  color: #ffffff;
  background: rgba(20, 20, 30, 0.8);
  padding: 0.75rem 1.5rem;
  border: 2px solid #4a4a5a;
  border-radius: 8px;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.8);
}

/* Cauldron Animation */
@keyframes bubble {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.cauldron-asset {
  animation: bubble 2s ease-in-out infinite;
}

/* Responsive */
@media (max-width: 640px) {
  .pixel-nav-button img {
    width: 48px;
    height: 48px;
  }
  
  .pixel-button-text {
    font-size: 1rem;
  }
  
  .step-indicator {
    top: 1rem;
    right: 1rem;
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
  
  .pixel-option-card {
    padding: 1rem;
  }
}
```

## Data Flow

### Configuration State Flow

1. **User Input** → `PixelInput` or `OptionGrid` component
2. **Component Event** → `onUpdate` callback in `WizardStep`
3. **State Update** → `updateConfig` from `useConfigStore`
4. **Persistence** → Zustand middleware saves to localStorage
5. **Validation** → `wizard-validation.ts` checks current step
6. **Navigation** → Enable/disable Next button based on validation

### Step Transition Flow

1. User clicks "Next" button
2. `handleNext` validates current step
3. If valid, trigger fade-out animation
4. Update `currentStep` in wizard state
5. Trigger fade-in animation for new step
6. Preload assets for next step (if any)

## Error Handling

### Validation Errors

Display validation errors below the input field or option grid:

```typescript
{validationError && (
  <div className="pixel-error-message mt-4 p-3 bg-red-900/50 border-2 border-red-500 rounded">
    <p className="text-red-200 text-sm">{validationError}</p>
  </div>
)}
```

### Asset Loading Failures

Provide fallback for missing images:

```typescript
<img 
  src="/cauldron.png" 
  alt="Cauldron"
  onError={(e) => {
    e.currentTarget.style.display = 'none';
  }}
/>
```

## Accessibility

### Keyboard Navigation

- **Tab**: Move between interactive elements
- **Enter/Space**: Select option or proceed to next step
- **Escape**: Go back to previous step (if available)
- **Arrow Keys**: Navigate within option grids

### ARIA Labels

```typescript
<div role="radiogroup" aria-label="Frontend framework selection">
  {options.map(option => (
    <button
      role="radio"
      aria-checked={selected === option.value}
      aria-label={option.label}
    >
      {option.label}
    </button>
  ))}
</div>
```

### Screen Reader Announcements

```typescript
// Announce step changes
useEffect(() => {
  const announcement = `Step ${currentStep + 1} of ${totalSteps}: ${currentStepConfig.title}`;
  announceToScreenReader(announcement);
}, [currentStep]);

function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}
```

## Performance Optimization

### Image Optimization

1. **Compress assets**: Use TinyPNG or similar (target: < 200KB each)
2. **Lazy loading**: Load next step assets in background
3. **Preloading**: Preload critical assets on wizard mount

```typescript
useEffect(() => {
  // Preload next step assets
  if (currentStep < totalSteps - 1) {
    const nextStep = steps[currentStep + 1];
    nextStep.options?.forEach(option => {
      if (option.icon) {
        const img = new Image();
        img.src = option.icon;
      }
    });
  }
}, [currentStep]);
```

### Debounced Validation

```typescript
const debouncedValidate = useMemo(
  () => debounce((value: string) => {
    const result = validateProjectName(value);
    setValidationError(result === true ? null : result);
  }, 300),
  []
);
```

## Migration Strategy

### Preserving Old Wizard

1. **Move existing page**: `src/app/configure/page.tsx` → `src/app/configure-old/page.tsx`
2. **Keep component**: `ConfigurationWizard.tsx` remains unchanged
3. **Create new page**: New `src/app/configure/page.tsx` with `PixelArtWizard`
4. **Add navigation link**: Optional link in footer or header to switch between UIs

### Gradual Rollout (Optional)

Use feature flag to toggle between old and new wizard:

```typescript
// src/app/configure/page.tsx
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';

export default function ConfigurePage() {
  const usePixelArtWizard = useFeatureFlag('pixel-art-wizard');
  
  return usePixelArtWizard ? <PixelArtWizard /> : <ConfigurationWizard />;
}
```

## Testing Strategy

### Visual Testing

1. Test all wizard steps render correctly
2. Verify animations are smooth (60fps)
3. Test on multiple screen sizes (320px to 2560px)
4. Verify asset loading and fallbacks

### Functional Testing

1. Test navigation between steps
2. Verify state persistence across steps
3. Test validation for each step
4. Verify final configuration object is correct
5. Test back button preserves data

### Accessibility Testing

1. Keyboard navigation through all steps
2. Screen reader announcements
3. Focus management
4. Color contrast ratios
5. ARIA labels and roles

### Performance Testing

1. Lighthouse audit (target: > 85)
2. Asset loading times
3. Animation performance (no jank)
4. Memory usage during navigation

## Interactive Enhancements

### Framework Logo Display

Framework logos will be displayed as potion bottle images. Each option card will show the official framework logo or a themed potion bottle variant.

**Logo Sources:**
- Next.js: Official Next.js logo
- React: Official React logo
- Vue: Official Vue logo
- Angular: Official Angular logo
- Svelte: Official Svelte logo

**Implementation:**
```typescript
const frameworkLogos = {
  nextjs: '/icons/frameworks/nextjs-logo.svg',
  react: '/icons/frameworks/react-logo.svg',
  vue: '/icons/frameworks/vue-logo.svg',
  angular: '/icons/frameworks/angular-logo.svg',
  svelte: '/icons/frameworks/svelte-logo.svg',
};
```

### Hover Sparkle Effects

Sparkles will appear around option cards on hover using CSS animations and pseudo-elements or dynamically generated particle elements.

**CSS Approach:**
```css
.pixel-option-card::before,
.pixel-option-card::after {
  content: '✨';
  position: absolute;
  font-size: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pixel-option-card:hover::before {
  top: -10px;
  left: -10px;
  opacity: 1;
  animation: sparkle-float 1.5s ease-in-out infinite;
}

.pixel-option-card:hover::after {
  bottom: -10px;
  right: -10px;
  opacity: 1;
  animation: sparkle-float 1.5s ease-in-out infinite 0.5s;
}

@keyframes sparkle-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.2); }
}
```

**JavaScript Approach (for more sparkles):**
```typescript
function createSparkles(element: HTMLElement) {
  const sparkleCount = 4;
  const sparkles: HTMLElement[] = [];
  
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✨';
    sparkle.style.position = 'absolute';
    sparkle.style.pointerEvents = 'none';
    
    // Random position around the card
    const angle = (i / sparkleCount) * Math.PI * 2;
    const distance = 60;
    sparkle.style.left = `${50 + Math.cos(angle) * distance}%`;
    sparkle.style.top = `${50 + Math.sin(angle) * distance}%`;
    
    element.appendChild(sparkle);
    sparkles.push(sparkle);
  }
  
  return () => sparkles.forEach(s => s.remove());
}
```

### Selection Checkmark

A checkmark icon will appear in the top-right corner of selected option cards.

**Component Update:**
```typescript
<div className={`pixel-option-card ${isSelected ? 'selected' : ''}`}>
  {isSelected && (
    <div className="checkmark-badge">
      <svg viewBox="0 0 24 24" className="checkmark-icon">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </div>
  )}
  <img src={option.logo} alt={option.label} />
  <span>{option.label}</span>
</div>
```

**Styles:**
```css
.checkmark-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(180, 255, 100, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: checkmark-appear 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 0 12px rgba(180, 255, 100, 0.8);
}

.checkmark-icon {
  width: 20px;
  height: 20px;
  fill: #1a1a1a;
}

@keyframes checkmark-appear {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
```

### Flying Animation to Cauldron

When the user clicks "Next", the selected option will animate flying into the cauldron.

**Implementation:**
```typescript
async function animateOptionToCauldron(
  optionElement: HTMLElement,
  cauldronElement: HTMLElement
) {
  // Get positions
  const optionRect = optionElement.getBoundingClientRect();
  const cauldronRect = cauldronElement.getBoundingClientRect();
  
  // Calculate trajectory
  const startX = optionRect.left + optionRect.width / 2;
  const startY = optionRect.top + optionRect.height / 2;
  const endX = cauldronRect.left + cauldronRect.width / 2;
  const endY = cauldronRect.top + cauldronRect.height / 2;
  
  // Create flying clone
  const clone = optionElement.cloneNode(true) as HTMLElement;
  clone.style.position = 'fixed';
  clone.style.left = `${startX}px`;
  clone.style.top = `${startY}px`;
  clone.style.transform = 'translate(-50%, -50%)';
  clone.style.zIndex = '9999';
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);
  
  // Animate
  clone.animate([
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
  }).onfinish = () => {
    clone.remove();
    triggerCauldronSplash(cauldronElement);
  };
}

function triggerCauldronSplash(cauldronElement: HTMLElement) {
  // Add splash effect class
  cauldronElement.classList.add('splash');
  setTimeout(() => {
    cauldronElement.classList.remove('splash');
  }, 500);
}
```

**Cauldron Splash Effect:**
```css
.cauldron-asset.splash {
  animation: cauldron-splash 0.5s ease-out;
}

@keyframes cauldron-splash {
  0% { transform: scale(1); }
  30% { transform: scale(1.1); filter: brightness(1.3); }
  100% { transform: scale(1); filter: brightness(1); }
}
```

### Reduced Motion Support

All animations will respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  .pixel-option-card::before,
  .pixel-option-card::after {
    animation: none;
  }
  
  .checkmark-badge {
    animation: none;
  }
  
  .cauldron-asset {
    animation: none;
  }
}
```

```typescript
// In flying animation
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Simple fade instead of flying
  await fadeTransition();
} else {
  await animateOptionToCauldron(optionElement, cauldronElement);
}
```

## Future Enhancements

1. **Animated Cauldron**: Use sprite sheet or Lottie for bubbling animation
2. **Sound Effects**: Optional magical sounds on interactions
3. **More Particle Effects**: Floating sparkles or magical dust throughout the scene
4. **Step Branching**: Conditional steps based on previous selections
5. **Save/Load Configurations**: Allow users to save and load preset configurations
6. **Tooltips**: Hover tooltips with additional information about each option
