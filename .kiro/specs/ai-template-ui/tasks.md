# Implementation Plan: AI Template Integration

- [x] 1. Update configuration types and defaults
  - Update ScaffoldConfig interface to change `aiTemplate?: string` to `aiTemplates: string[]`
  - Update default configuration to use empty array for aiTemplates
  - Update Zod schema to validate aiTemplates as array
  - Add migration logic for old configs with singular aiTemplate
  - _Requirements: 1.3, 1.4, 5.1, 5.2_

- [ ]* 1.1 Write property test for configuration type updates
  - **Property 2: AI template selection updates configuration**
  - **Validates: Requirements 1.3**

- [ ]* 1.2 Write property test for multiple template selections
  - **Property 3: Multiple AI template selections are stored**
  - **Validates: Requirements 1.4**

- [x] 2. Add AI template wizard step
  - Add AI template step configuration to wizard-steps.ts (step index 8)
  - Configure as multi-select option grid with 3 columns
  - Add all 5 AI template options with icons and descriptions
  - Use lucide-react icons for template types
  - Update TOTAL_WIZARD_STEPS constant to 10
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 2.1 Write property test for AI template option rendering
  - **Property 1: AI template options display required information**
  - **Validates: Requirements 1.2**

- [x] 3. Add AI provider wizard step with conditional rendering
  - Add AI provider step configuration to wizard-steps.ts (step index 9)
  - Configure as single-select option grid with 2 columns
  - Add all 4 AI provider options with icons and descriptions
  - Add conditional function to only show when aiTemplates.length > 0
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 3.1 Write property test for conditional provider step rendering
  - **Property 5: AI provider step shows when templates selected**
  - **Property 8: AI provider step skipped when no templates**
  - **Validates: Requirements 2.1, 2.4**

- [ ]* 3.2 Write property test for provider selection
  - **Property 7: AI provider selection updates configuration**
  - **Validates: Requirements 2.3**

- [ ] 4. Implement conditional step logic in wizard
  - Add conditional rendering support to WizardStep component
  - Check conditional function before rendering step content
  - Update navigation logic to skip conditional steps when condition is false
  - Ensure step counter accounts for skipped steps
  - _Requirements: 2.1, 2.4_

- [x] 5. Add AI template compatibility rules
  - Add isAITemplateCompatible function to compatibility-rules.ts
  - Check if framework is Next.js or monorepo structure
  - Add getCompatibleAIProviders function to filter providers
  - Integrate compatibility check with OptionGrid disabled state
  - _Requirements: 1.5, 2.2, 4.2_

- [ ]* 5.1 Write property test for framework compatibility
  - **Property 4: Incompatible frameworks disable AI templates**
  - **Validates: Requirements 1.5**

- [ ]* 5.2 Write property test for provider filtering
  - **Property 6: Only compatible providers are shown**
  - **Validates: Requirements 2.2**

- [x] 6. Add validation for AI template selections
  - Add validateAITemplateStep function to wizard-validation.ts
  - Add validateAIProviderStep function to wizard-validation.ts
  - Ensure provider is required when templates are selected
  - Add appropriate error messages for validation failures
  - _Requirements: 4.1, 4.4_

- [ ]* 6.1 Write property test for provider validation
  - **Property 9: Validation fails without provider when templates selected**
  - **Validates: Requirements 4.1**

- [ ]* 6.2 Write property test for validation error announcements
  - **Property 12: Validation errors are announced to screen readers**
  - **Validates: Requirements 4.4**

- [x] 7. Implement framework change cleanup logic
  - Add effect in config-store.ts to watch for framework changes
  - Clear aiTemplates array when framework becomes incompatible
  - Clear aiProvider when templates are cleared
  - Ensure cleanup happens before state is persisted
  - _Requirements: 4.3_

- [ ]* 7.1 Write property test for framework change cleanup
  - **Property 11: Framework changes clear incompatible templates**
  - **Validates: Requirements 4.3**

- [x] 8. Verify persistence functionality
  - Test that aiTemplates array persists to localStorage
  - Test that aiProvider persists to localStorage
  - Test that state is restored correctly on page reload
  - Verify Zustand persist middleware handles array serialization
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 8.1 Write property test for template persistence
  - **Property 13: AI template persistence round-trip**
  - **Validates: Requirements 5.1, 5.2**

- [ ]* 8.2 Write property test for provider persistence
  - **Property 14: AI provider persistence round-trip**
  - **Validates: Requirements 5.3, 5.4**

- [x] 9. Add AI template icons and assets
  - Add or verify lucide-react icons for AI templates
  - Add provider logo SVGs to public/icons/ai/ directory
  - Preload AI template assets in asset-preloader.ts
  - Ensure icons display correctly in option grid
  - _Requirements: 1.2, 3.1, 3.2, 3.3_

- [x] 10. Update OptionGrid component for AI templates
  - Verify multi-select functionality works with AI templates
  - Ensure disabled state styling is consistent
  - Add hover details for AI template cards (features, generated files)
  - Test keyboard navigation with AI template options
  - _Requirements: 1.1, 1.2, 1.4, 3.1, 3.2, 3.3_

- [ ]* 10.1 Write unit tests for OptionGrid AI template rendering
  - Test that AI template options render with correct props
  - Test that multi-select works correctly
  - Test that disabled state is applied correctly
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Test complete user flow
  - Test navigating through wizard with AI template selection
  - Test selecting multiple AI templates
  - Test provider step appears after template selection
  - Test skipping AI templates (provider step should not appear)
  - Test framework compatibility (templates disabled for non-Next.js)
  - Test persistence across page reloads
  - _Requirements: All_

- [ ]* 12.1 Write integration tests for complete AI template flow
  - Test complete flow from template selection to provider selection
  - Test framework compatibility flow
  - Test skip provider flow
  - _Requirements: All_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
