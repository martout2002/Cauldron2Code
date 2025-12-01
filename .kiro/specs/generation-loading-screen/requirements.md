# Requirements Document

## Introduction

This feature introduces a dedicated loading screen that displays during the boilerplate generation process. When users click the "Generate" button in the wizard, instead of immediately navigating to the end/summary screen, they will see an animated loading screen with a spinning cauldron animation using existing pixel art assets (loading_1.png, loading_2.png, loading_3.png) and a "Generating..." message. This provides visual feedback during the generation process and creates a more polished user experience.

## Glossary

- **Wizard**: The multi-step configuration interface where users select their tech stack options
- **Generation Process**: The backend process that creates the boilerplate code based on user selections
- **Loading Screen**: A dedicated UI screen that displays during the generation process
- **Cauldron Animation**: A spinning animation created by cycling through three loading image frames
- **Summary Screen**: The final screen that displays after generation completes (currently shown immediately)

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a loading screen when I click "Generate", so that I understand the system is working on creating my boilerplate.

#### Acceptance Criteria

1. WHEN a user clicks the "Generate" button in the wizard THEN the system SHALL display a loading screen
2. WHEN the loading screen displays THEN the system SHALL show a centered cauldron animation
3. WHEN the loading screen displays THEN the system SHALL show the text "Generating..." below the animation
4. WHEN the generation process completes THEN the system SHALL navigate to the summary/end screen
5. WHEN the loading screen is visible THEN the system SHALL prevent user navigation away from the loading screen

### Requirement 2

**User Story:** As a user, I want to see a smooth spinning animation, so that I have engaging visual feedback during the wait.

#### Acceptance Criteria

1. WHEN the loading screen displays THEN the system SHALL cycle through loading_1.png, loading_2.png, and loading_3.png images
2. WHEN cycling through animation frames THEN the system SHALL maintain a consistent frame rate between 200ms and 400ms per frame
3. WHEN the animation plays THEN the system SHALL loop continuously until generation completes
4. WHEN displaying animation frames THEN the system SHALL maintain the pixel art aesthetic without blur or smoothing
5. WHEN the cauldron animation displays THEN the system SHALL center it horizontally and vertically on the screen

### Requirement 3

**User Story:** As a user, I want the loading screen to match the pixel art theme, so that the experience feels cohesive.

#### Acceptance Criteria

1. WHEN the loading screen displays THEN the system SHALL use a dark background consistent with the wizard theme
2. WHEN displaying text THEN the system SHALL use pixel-style typography matching the existing wizard UI
3. WHEN rendering images THEN the system SHALL apply image-rendering: pixelated to preserve pixel art quality
4. WHEN the loading screen displays THEN the system SHALL include sparkle effects consistent with the wizard aesthetic
5. WHEN displaying the cauldron THEN the system SHALL maintain the green glow effect visible in the reference image

### Requirement 4

**User Story:** As a developer, I want the loading screen to integrate with the existing generation flow, so that it works seamlessly with the current architecture.

#### Acceptance Criteria

1. WHEN the generate button is clicked THEN the system SHALL initiate the generation API call
2. WHEN the generation API call is in progress THEN the system SHALL display the loading screen
3. WHEN the generation API returns success THEN the system SHALL navigate to the summary screen with the generation ID
4. WHEN the generation API returns an error THEN the system SHALL display an error message and allow retry
5. WHEN the loading screen component mounts THEN the system SHALL preload all three animation frame images

### Requirement 5

**User Story:** As a user, I want appropriate error handling during generation, so that I understand what went wrong if the process fails.

#### Acceptance Criteria

1. IF the generation API call fails THEN the system SHALL display a user-friendly error message
2. WHEN an error occurs THEN the system SHALL provide a "Try Again" button to retry generation
3. WHEN an error occurs THEN the system SHALL log the error details for debugging
4. IF the generation takes longer than 30 seconds THEN the system SHALL continue showing the loading animation
5. WHEN the user clicks "Try Again" THEN the system SHALL restart the generation process and show the loading screen again
