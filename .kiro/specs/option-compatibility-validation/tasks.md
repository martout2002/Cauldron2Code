# Implementation Plan

- [x] 1. Create compatibility rules infrastructure
  - Create `src/lib/wizard/compatibility-rules.ts` module for rule definitions and types
  - Define `CompatibilityRule` interface with id, description, target, condition, and message generator
  - Define `CompatibilityResult` interface for evaluation results
  - Export rule registry array for centralized rule management
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ]* 1.1 Write property test for rule evaluation
  - **Property 8: Rules are evaluated with current configuration**
  - **Validates: Requirements 3.1, 3.3**

- [x] 2. Implement core compatibility rules
  - Add frontend/backend compatibility rules (Next.js with Express/Fastify/NestJS, Next.js API with non-Next.js frontends)
  - Add database/auth compatibility rules (MongoDB with Supabase Auth, database requirements for NextAuth)
  - Add project structure/extras compatibility rules (frontend-only with Redis, backend requirements)
  - Implement message generators that reference conflicting options by name
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.2, 6.5, 7.1, 7.4_

- [ ]* 2.1 Write unit tests for specific compatibility rules
  - Test Next.js frontend disables Express/Fastify/NestJS backends
  - Test non-Next.js frontends disable Next.js API backend
  - Test MongoDB disables Supabase Auth
  - Test frontend-only structure disables Redis
  - _Requirements: 5.1, 5.2, 6.2, 7.1_

- [x] 3. Create compatibility evaluation engine
  - Create `src/lib/wizard/compatibility-evaluator.ts` module
  - Implement `evaluateCompatibility(stepId, optionValue, config)` function that checks all rules for the option
  - Implement rule aggregation logic (if any rule fails, option is incompatible)
  - Implement message prioritization (return most relevant incompatibility message)
  - Add error handling for rule evaluation exceptions (fail-open approach)
  - _Requirements: 2.4, 3.1, 3.4_

- [ ]* 3.1 Write property test for rule aggregation
  - **Property 7: Multiple rules aggregate correctly**
  - **Validates: Requirements 2.4, 3.4**

- [x] 4. Add performance optimization with caching
  - Implement result caching using Map with config hash as key
  - Add cache invalidation on configuration changes
  - Implement memoization for step-level compatibility evaluation
  - Add performance measurement logging in development mode
  - _Requirements: 8.1, 8.2, 8.4_

- [ ]* 4.1 Write property test for caching behavior
  - **Property 11: Results are cached until state changes**
  - **Validates: Requirements 8.2**

- [ ]* 4.2 Write property test for evaluation performance
  - **Property 10: Compatibility evaluation performance**
  - **Validates: Requirements 8.1**

- [ ]* 4.3 Write property test for precomputation performance
  - **Property 12: Initial compatibility precomputation**
  - **Validates: Requirements 8.4**

- [x] 5. Create React hook for compatibility checking
  - Create `src/lib/wizard/useCompatibility.ts` hook
  - Implement `isOptionCompatible(stepId, optionValue)` function using evaluator
  - Implement `getCompatibleOptions(stepId, options)` function that maps options to enhanced options with disabled state
  - Use React.useMemo to cache results per step
  - Subscribe to config store changes to trigger re-evaluation
  - _Requirements: 1.3, 1.4, 5.5, 7.5_

- [ ]* 5.1 Write property test for state change reactivity
  - **Property 2: State changes trigger compatibility re-evaluation**
  - **Validates: Requirements 1.3, 5.5, 7.5**

- [ ]* 5.2 Write property test for compatible configurations
  - **Property 4: Compatible configurations have no disabled options**
  - **Validates: Requirements 1.4**

- [x] 6. Update OptionGrid component for disabled states
  - Modify `src/components/wizard/OptionGrid.tsx` to accept compatibility information
  - Add disabled state styling (reduced opacity, no hover effects, disabled cursor)
  - Prevent click events on disabled options
  - Ensure consistent styling across all disabled options
  - _Requirements: 1.1, 1.2, 1.5_

- [ ]* 6.1 Write property test for disabled option selection prevention
  - **Property 1: Disabled options are unselectable**
  - **Validates: Requirements 1.2, 4.3**

- [ ]* 6.2 Write property test for consistent disabled styling
  - **Property 3: Disabled options have consistent visual styling**
  - **Validates: Requirements 1.5**

- [x] 7. Implement incompatibility tooltips
  - Add tooltip state management to OptionGrid for disabled options
  - Render tooltip with incompatibility message on hover
  - Include conflicting option name in tooltip text
  - Implement tooltip hide timing (200ms after mouse leave)
  - Add debouncing for rapid hover events (100ms)
  - Distinguish between description tooltips (enabled) and incompatibility tooltips (disabled)
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 8.3_

- [ ]* 7.1 Write property test for tooltip content
  - **Property 5: Disabled options display explanatory tooltips**
  - **Validates: Requirements 2.1, 2.2, 2.5**

- [ ]* 7.2 Write property test for tooltip timing
  - **Property 6: Tooltip visibility timing**
  - **Validates: Requirements 2.3**

- [x] 8. Add accessibility attributes for disabled options
  - Add `aria-disabled="true"` to disabled option buttons
  - Create hidden description elements for incompatibility messages
  - Link disabled options to descriptions using `aria-describedby`
  - Ensure disabled options remain focusable for keyboard navigation
  - Prevent selection on Enter/Space key press for disabled options
  - Update ARIA attributes immediately when disabled state changes
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 8.1 Write property test for ARIA attributes
  - **Property 9: Disabled options have correct ARIA attributes**
  - **Validates: Requirements 4.1, 4.2, 4.4, 4.5**

- [x] 9. Integrate compatibility checking into WizardStep component
  - Modify `src/components/wizard/WizardStep.tsx` to use compatibility hook
  - Pass enhanced options with disabled state to OptionGrid
  - Ensure compatibility is evaluated on step load
  - Add loading state during initial compatibility evaluation
  - _Requirements: 1.3, 8.4, 8.5_

- [ ]* 9.1 Write property test for non-blocking transitions
  - **Property 13: Non-blocking step transitions**
  - **Validates: Requirements 8.5**

- [x] 10. Add error handling and fallbacks
  - Implement try-catch in rule evaluation with fail-open behavior
  - Add fallback incompatibility message for missing content
  - Add development mode logging for rule evaluation errors
  - Add performance warnings when evaluation exceeds time budget
  - _Requirements: Error Handling section_

- [ ]* 10.1 Write unit tests for error handling
  - Test rule evaluation exception handling
  - Test fallback message display
  - Test performance degradation logging
  - _Requirements: Error Handling section_

- [x] 11. Add visual polish and animations
  - Add smooth opacity transitions for disabled state changes
  - Add tooltip fade-in/fade-out animations (respect prefers-reduced-motion)
  - Ensure high contrast mode compatibility for disabled states
  - Add visual feedback when hovering over disabled options (subtle cursor change)
  - _Requirements: 1.1, 1.5, 2.3_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
