# Implementation Plan

- [x] 1. Create GitHub Authentication Step Component
  - Create `src/components/wizard/GitHubAuthStep.tsx` with sign-in UI
  - Implement OAuth redirect handling
  - Display current authentication status
  - Add skip option for users who don't want GitHub integration
  - Style component to match pixel art theme
  - _Requirements: 1.1, 1.3, 1.4_

- [ ]* 1.1 Write property test for authentication state management
  - **Property 6: Authentication persistence**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 2. Update Configuration Store for GitHub Settings
  - Add `githubEnabled` boolean field to config store
  - Add `githubRepoPrivate` boolean field to config store
  - Implement `setGithubEnabled` action
  - Implement `setGithubRepoPrivate` action
  - Persist GitHub settings to localStorage
  - _Requirements: 6.1, 6.2_

- [ ]* 2.1 Write unit tests for store updates
  - Test githubEnabled state changes
  - Test githubRepoPrivate state changes
  - Test localStorage persistence
  - _Requirements: 6.1, 6.2_

- [x] 3. Implement Repository Name Sanitization
  - Create `src/lib/github/repo-name-sanitizer.ts`
  - Implement sanitization logic for GitHub repository names
  - Handle invalid characters, length limits, and special cases
  - Export sanitization function
  - _Requirements: 7.4_

- [ ]* 3.1 Write property test for name sanitization
  - **Property 5: Repository name sanitization**
  - **Validates: Requirements 7.4**

- [x] 4. Modify ConfigurePage Generation Handler
  - Update `handleGenerate()` to check GitHub authentication state
  - Route to `/api/github/repos/create` when GitHub is enabled
  - Route to `/api/generate` when GitHub is disabled
  - Pass repository configuration (name, description, privacy)
  - Handle both success paths appropriately
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]* 4.1 Write property test for workflow routing
  - **Property 1: Authentication state determines workflow**
  - **Validates: Requirements 1.2, 4.1, 8.1, 8.2, 8.3**

- [x] 5. Update GenerationLoadingScreen Component
  - Add `mode` prop to accept 'github' or 'zip'
  - Display "Pushing to GitHub..." message when mode is 'github'
  - Display "Generating..." message when mode is 'zip'
  - Maintain existing animation and styling
  - _Requirements: 2.1, 2.2_

- [ ]* 5.1 Write property test for loading screen visibility
  - **Property 2: Loading screen visibility during generation**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [x] 6. Create GitHub Success Screen
  - Create success screen variant for GitHub repository creation
  - Display repository URL prominently
  - Add "View Repository" button that opens in new tab
  - Show repository name and description
  - Add "Create Another" button
  - Remove ZIP download and "Create GitHub Repository" options
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ]* 6.1 Write property test for success screen variants
  - **Property 3: Success screen matches generation type**
  - **Validates: Requirements 3.1, 3.2, 3.3, 4.2, 4.3**

- [x] 7. Update ZIP Success Screen
  - Ensure ZIP success screen only shows when GitHub is disabled
  - Keep existing download button and deployment guides
  - Remove GitHub repository creation button
  - Maintain existing styling and functionality
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 8. Implement Error Handling with Fallback
  - Update error handling in `handleGenerate()` to detect GitHub errors
  - Display specific error messages for different error types
  - Add "Download ZIP Instead" fallback button on all GitHub errors
  - Implement fallback flow that calls `/api/generate` on user request
  - Log errors for debugging
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 8.1 Write property test for error fallback
  - **Property 4: Error handling provides fallback**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [x] 9. Add Duplicate Request Prevention
  - Update `handleGenerate()` to check if generation is in progress
  - Prevent multiple simultaneous generation requests
  - Show warning in console if duplicate request is attempted
  - Maintain loading state throughout generation process
  - _Requirements: 2.5_

- [ ]* 9.1 Write property test for duplicate prevention
  - **Property 7: Duplicate request prevention**
  - **Validates: Requirements 2.5**

- [x] 10. Update Wizard Step Navigation
  - Ensure GitHub auth step appears after summary
  - Update wizard step order in `wizard-steps.ts`
  - Handle conditional display of GitHub auth step
  - Update progress indicators to include GitHub auth step
  - _Requirements: 1.1_

- [x] 11. Implement Authentication Persistence
  - Store GitHub authentication token securely in httpOnly cookies
  - Check authentication status on app load
  - Auto-skip GitHub auth step if already authenticated
  - Handle token expiration gracefully
  - Implement sign-out functionality
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Update API Integration
  - Ensure `/api/github/repos/create` receives correct parameters
  - Pass sanitized repository name
  - Pass project description
  - Pass privacy setting
  - Pass full scaffold configuration
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ]* 12.1 Write property test for repository completeness
  - **Property 8: Repository content completeness**
  - **Validates: Requirements 7.5**

- [x] 13. Remove Old GitHub Repository Modal
  - Remove `CreateRepoModal` component usage from ConfigurePage
  - Remove modal state management code
  - Remove "Create GitHub Repository" button from success screen
  - Clean up unused imports and state variables
  - _Requirements: 3.5_

- [x] 14. Update Error Messages
  - Create error message constants for GitHub-specific errors
  - Implement error message display component
  - Add retry buttons for recoverable errors
  - Add fallback buttons for all errors
  - Style error messages to match pixel art theme
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 16. Write integration tests for complete flows
  - Test end-to-end GitHub flow (auth → generate → repository)
  - Test end-to-end ZIP flow (skip auth → generate → download)
  - Test error recovery flow (GitHub error → fallback → ZIP)
  - _Requirements: All_

- [x] 17. Update documentation
  - Document new GitHub integration flow
  - Update user-facing documentation
  - Add developer notes for future maintenance
  - Document error handling patterns
  - _Requirements: All_
