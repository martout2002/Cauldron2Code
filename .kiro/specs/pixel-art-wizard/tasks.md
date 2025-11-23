# Implementation Plan

- [x] 1. Preserve existing configuration wizard
  - Move `src/app/configure/page.tsx` to `src/app/configure-old/page.tsx`
  - Verify the old wizard remains fully functional at `/configure-old` route
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 2. Set up wizard infrastructure and state management
- [x] 2.1 Create wizard state management
  - Create `src/lib/wizard/wizard-state.ts` with Zustand store for wizard-specific state (currentStep, totalSteps, completedSteps, stepData, isTransitioning)
  - Implement navigation functions (nextStep, previousStep, goToStep, updateStepData)
  - _Requirements: 2.7, 7.1, 7.2_

- [x] 2.2 Define wizard steps configuration
  - Create `src/lib/wizard/wizard-steps.ts` with StepConfig interface
  - Define all 8 wizard steps with titles, subtitles, field mappings, and options
  - Include step configurations for: project name, description, frontend, backend, database, auth, styling, and extras
  - _Requirements: 1.1, 1.2, 2.1_

- [x] 2.3 Create wizard validation logic
  - Create `src/lib/wizard/wizard-validation.ts` with step-specific validation functions
  - Implement validation for project name (required, lowercase, hyphens only)
  - Implement validation for required selections in each step
  - _Requirements: 1.9, 7.4, 7.5_

- [x] 3. Create base wizard components
- [x] 3.1 Create WizardBackground component
  - Create `src/components/wizard/WizardBackground.tsx`
  - Implement full-screen background with background.png image
  - Add fallback background color for loading states
  - _Requirements: 1.3, 3.2_

- [x] 3.2 Create CauldronAsset component
  - Create `src/components/wizard/CauldronAsset.tsx`
  - Implement cauldron image display with bubbling animation using CSS keyframes
  - Position cauldron centered in the scene
  - _Requirements: 1.4, 8.2_

- [x] 3.3 Create StepIndicator component
  - Create `src/components/wizard/StepIndicator.tsx`
  - Display current step and total steps (e.g., "Step 1 of 8")
  - Position in top-right corner with pixel-art styling
  - _Requirements: 2.6_

- [x] 4. Create input and selection components
- [x] 4.1 Create PixelInput component
  - Create `src/components/wizard/PixelInput.tsx`
  - Style input field with search_bar.png asset as background
  - Add magnifying glass icon inside input field
  - Implement focus glow effect
  - _Requirements: 1.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.2 Create PixelButton component
  - Create `src/components/wizard/PixelButton.tsx`
  - Implement reusable button with pixel-art styling
  - Add hover glow and press animations
  - Support disabled state with reduced opacity
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 4.3 Create OptionGrid component
  - Create `src/components/wizard/OptionGrid.tsx`
  - Implement grid layout for framework/tech selection
  - Support single and multi-select modes
  - Add selected state with green glow effect
  - _Requirements: 3.4, 3.6_

- [x] 4.4 Create CheckboxGroup component
  - Create `src/components/wizard/CheckboxGroup.tsx`
  - Implement checkbox group for extras and deployment targets
  - Style checkboxes with pixel-art aesthetic
  - _Requirements: 3.4, 3.6_

- [x] 5. Create navigation components
- [x] 5.1 Create NavigationControls component
  - Create `src/components/wizard/NavigationControls.tsx`
  - Implement Back button with broom_stick.png icon in bottom-left
  - Implement Next button with ladle.png icon in bottom-right
  - Replace Next with Generate button on final step
  - Disable Back button on first step
  - Disable Next button when step is invalid
  - _Requirements: 1.6, 1.7, 2.2, 2.3, 2.4, 2.5, 2.8, 5.1, 5.2, 5.6_

- [x] 6. Create main wizard components
- [x] 6.1 Create WizardStep component
  - Create `src/components/wizard/WizardStep.tsx`
  - Implement step wrapper with title, subtitle, and cauldron
  - Render dynamic content based on step type (text-input, option-grid, checkbox-group)
  - Add fade-in/fade-out animations for step transitions
  - _Requirements: 1.1, 1.2, 1.4, 8.1_

- [x] 6.2 Create PixelArtWizard container component
  - Create `src/components/wizard/PixelArtWizard.tsx`
  - Implement main wizard container orchestrating all components
  - Integrate wizard state management and config store
  - Implement step navigation with validation
  - Add transition animations between steps
  - Handle final step generation trigger
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 8.1, 8.4_

- [x] 7. Create new configure page
  - Create new `src/app/configure/page.tsx` with PixelArtWizard
  - Import and render PixelArtWizard component
  - Maintain integration with existing validation, toast, and generation systems
  - _Requirements: 1.1, 10.5_

- [x] 8. Add pixel-art wizard styles
  - Add wizard-specific CSS classes to `src/app/globals.css`
  - Implement .wizard-step, .pixel-title, .pixel-subtitle styles
  - Implement .pixel-input, .pixel-input-wrapper, .pixel-input-bg styles
  - Implement .pixel-nav-button, .pixel-button-text styles
  - Implement .pixel-option-card, .pixel-option-label styles
  - Implement .step-indicator styles
  - Add @keyframes bubble animation for cauldron
  - Add responsive styles for mobile viewports
  - _Requirements: 1.8, 3.1, 3.2, 3.5, 3.6, 3.7, 8.2, 8.3, 8.5_

- [x] 9. Implement responsive design
  - Test wizard on mobile (< 640px), tablet (640-1024px), and desktop (> 1024px) viewports
  - Adjust asset sizes for mobile devices
  - Ensure navigation buttons are accessible on mobile
  - Verify input fields are touch-friendly
  - Ensure cauldron remains visible and centered on all screen sizes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 10. Implement accessibility features
  - Add keyboard navigation support (Tab, Enter, Arrow keys, Escape)
  - Add ARIA labels and roles to all interactive elements
  - Implement screen reader announcements for step changes
  - Add visible focus indicators to all interactive elements
  - Verify color contrast ratios meet WCAG AA standards
  - Add alternative text for decorative images
  - Ensure validation errors are announced to screen readers
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 11. Implement state persistence
  - Integrate wizard state with existing useConfigStore
  - Ensure configuration persists to localStorage after each step
  - Implement restoration of wizard state on page reload
  - Test navigation preserves all user inputs
  - _Requirements: 7.1, 7.2, 7.3, 7.6_

- [x] 12. Implement performance optimizations
  - Optimize all wizard image assets (background.png, cauldron.png, broom_stick.png, ladle.png, search_bar.png) to < 200KB each
  - Implement asset preloading for next step during current step
  - Add debounced validation for text inputs
  - Verify animations run at 60fps without jank
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 13. Add optional enhancements
  - Add prefers-reduced-motion support for users with motion sensitivity
  - Add optional link to switch between old and new wizard UIs
  - _Requirements: 8.6, 10.6_

- [ ]* 14. Testing and validation
  - Test all wizard steps render correctly with proper data
  - Test navigation between all steps preserves state
  - Test validation for each step type
  - Test final configuration object matches expected format
  - Test on Chrome, Safari, Firefox, and Edge browsers
  - Verify Lighthouse performance score > 85
  - _Requirements: 11.5_
