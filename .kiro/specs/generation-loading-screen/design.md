# Design Document

## Overview

This feature introduces a dedicated loading screen component that displays during the boilerplate generation process. The loading screen will replace the current immediate navigation to the GenerationProgress component, providing a more engaging and thematic user experience with a spinning cauldron animation using the existing pixel art assets (loading_1.png, loading_2.png, loading_3.png).

The loading screen will be displayed between the wizard's final step and the success/download screen, creating a clear visual transition that indicates the system is actively working on generating the user's boilerplate.

## Architecture

### Component Structure

```
PixelArtWizard (existing)
  └─> handleGenerate() triggers generation
       └─> ConfigurePage (existing)
            ├─> GenerationLoadingScreen (NEW)
            │    ├─> Spinning cauldron animation
            │    ├─> "Generating..." text
            │    └─> Sparkle effects
            └─> Success Screen (existing)
```

### State Flow

1. User clicks "Generate" button in wizard
2. `handleGenerate()` is called in ConfigurePage
3. State changes to show GenerationLoadingScreen
4. API call to `/api/generate` is initiated
5. Loading screen displays with animation
6. On API success: Navigate to success/download screen
7. On API error: Display error message with retry option

### Integration Points

- **ConfigurePage**: Main orchestrator that manages state transitions
- **PixelArtWizard**: Triggers generation via `onGenerate` callback
- **GenerationLoadingScreen**: New component for loading state
- **GenerationProgress**: Existing component (may be deprecated or used for detailed progress)
- **API Route**: `/api/generate` endpoint for boilerplate generation

## Components and Interfaces

### GenerationLoadingScreen Component

```typescript
interface GenerationLoadingScreenProps {
  projectName?: string; // Optional project name to display
}

export function GenerationLoadingScreen({ 
  projectName 
}: GenerationLoadingScreenProps): JSX.Element
```

**Responsibilities:**
- Display spinning cauldron animation
- Show "Generating..." text with pixel font
- Render sparkle effects around cauldron
- Maintain pixel art aesthetic
- Prevent user interaction during generation

**Key Features:**
- Frame-based animation cycling through loading_1.png, loading_2.png, loading_3.png
- Configurable frame rate (default: 300ms per frame)
- Centered layout with dark background
- Pixel-perfect rendering (image-rendering: pixelated)
- Accessibility: Proper ARIA labels and loading announcements

### ConfigurePage State Updates

```typescript
// New state variables
const [showLoadingScreen, setShowLoadingScreen] = useState(false);

// Updated handleGenerate function
const handleGenerate = async () => {
  // Validation...
  
  setShowLoadingScreen(true); // Show loading screen immediately
  setError(null);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'generation_failed');
    }
    
    setDownloadId(data.downloadId);
    setShowLoadingScreen(false); // Hide loading screen
    toast.success('Scaffold Generated!', 'Your project is ready');
  } catch (err) {
    setShowLoadingScreen(false); // Hide loading screen
    setError(errorType);
    toast.error('Generation Failed', errorType);
  }
};
```

## Data Models

### Animation Frame Data

```typescript
interface AnimationFrame {
  src: string;        // Path to image (e.g., '/loading_1.png')
  alt: string;        // Accessibility description
  duration: number;   // Display duration in milliseconds
}

const ANIMATION_FRAMES: AnimationFrame[] = [
  { src: '/loading_1.png', alt: 'Cauldron brewing - frame 1', duration: 300 },
  { src: '/loading_2.png', alt: 'Cauldron brewing - frame 2', duration: 300 },
  { src: '/loading_3.png', alt: 'Cauldron brewing - frame 3', duration: 300 },
];
```

### Loading Screen State

```typescript
interface LoadingScreenState {
  currentFrame: number;      // Index of current animation frame (0-2)
  isAnimating: boolean;      // Whether animation is active
  frameInterval: NodeJS.Timeout | null; // Interval ID for cleanup
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN a user clicks the "Generate" button in the wizard THEN the system SHALL display a loading screen
Thoughts: This is about the UI state transition. For any wizard state where the generate button is clicked, the loading screen should become visible. We can test this by simulating the button click and checking if the loading screen component is rendered.
Testable: yes - property

1.2 WHEN the loading screen displays THEN the system SHALL show a centered cauldron animation
Thoughts: This is about the visual layout. For any loading screen render, the cauldron should be centered. We can test this by checking the CSS classes or computed styles.
Testable: yes - property

1.3 WHEN the loading screen displays THEN the system SHALL show the text "Generating..." below the animation
Thoughts: This is about required content. For any loading screen render, the text should be present. We can test by querying for the text content.
Testable: yes - property

1.4 WHEN the generation process completes THEN the system SHALL navigate to the summary/end screen
Thoughts: This is about state transitions. For any successful generation completion, the loading screen should be hidden and the success screen should be shown. We can test by mocking the API response and checking the rendered component.
Testable: yes - property

1.5 WHEN the loading screen is visible THEN the system SHALL prevent user navigation away from the loading screen
Thoughts: This is about interaction blocking. While the loading screen is visible, navigation controls should be disabled or hidden. We can test by checking if navigation elements are disabled or if click handlers are blocked.
Testable: yes - property

2.1 WHEN the loading screen displays THEN the system SHALL cycle through loading_1.png, loading_2.png, and loading_3.png images
Thoughts: This is about the animation sequence. For any loading screen display, the images should cycle in order. We can test by checking the src attribute of the image element over time.
Testable: yes - property

2.2 WHEN cycling through animation frames THEN the system SHALL maintain a consistent frame rate between 200ms and 400ms per frame
Thoughts: This is about timing constraints. For any frame transition, the duration should fall within the specified range. We can test by measuring the time between frame changes.
Testable: yes - property

2.3 WHEN the animation plays THEN the system SHALL loop continuously until generation completes
Thoughts: This is about animation behavior. The animation should restart from frame 1 after frame 3, continuing until the loading screen is unmounted. We can test by observing multiple cycles.
Testable: yes - property

2.4 WHEN displaying animation frames THEN the system SHALL maintain the pixel art aesthetic without blur or smoothing
Thoughts: This is about CSS rendering. The image-rendering property should be set to pixelated. We can test by checking the computed style.
Testable: yes - property

2.5 WHEN the cauldron animation displays THEN the system SHALL center it horizontally and vertically on the screen
Thoughts: This is the same as 1.2, redundant.
Testable: redundant with 1.2

3.1 WHEN the loading screen displays THEN the system SHALL use a dark background consistent with the wizard theme
Thoughts: This is about visual consistency. The background color should match the wizard's dark theme. We can test by checking the background color value.
Testable: yes - property

3.2 WHEN displaying text THEN the system SHALL use pixel-style typography matching the existing wizard UI
Thoughts: This is about font consistency. The font-family should match the wizard's pixel font. We can test by checking the computed font-family.
Testable: yes - property

3.3 WHEN rendering images THEN the system SHALL apply image-rendering: pixelated to preserve pixel art quality
Thoughts: This is the same as 2.4, redundant.
Testable: redundant with 2.4

3.4 WHEN the loading screen displays THEN the system SHALL include sparkle effects consistent with the wizard aesthetic
Thoughts: This is about visual elements. Sparkle effects should be present in the DOM. We can test by querying for sparkle elements or checking for specific CSS classes.
Testable: yes - property

3.5 WHEN displaying the cauldron THEN the system SHALL maintain the green glow effect visible in the reference image
Thoughts: This is about visual styling. The cauldron should have a green glow effect applied via CSS or be part of the image itself. We can test by checking for glow-related CSS properties or visual regression testing.
Testable: yes - example (visual regression)

4.1 WHEN the generate button is clicked THEN the system SHALL initiate the generation API call
Thoughts: This is about API integration. Clicking generate should trigger a fetch to /api/generate. We can test by mocking fetch and verifying it was called.
Testable: yes - property

4.2 WHEN the generation API call is in progress THEN the system SHALL display the loading screen
Thoughts: This is similar to 1.1 but focuses on the API call timing. While the API is pending, the loading screen should be visible. We can test by mocking a delayed API response.
Testable: yes - property

4.3 WHEN the generation API returns success THEN the system SHALL navigate to the summary screen with the generation ID
Thoughts: This is about successful state transitions. On API success, the loading screen should hide and the success screen should show with the correct ID. We can test by mocking a successful response.
Testable: yes - property

4.4 WHEN the generation API returns an error THEN the system SHALL display an error message and allow retry
Thoughts: This is about error handling. On API error, an error message should be shown and a retry mechanism should be available. We can test by mocking an error response.
Testable: yes - property

4.5 WHEN the loading screen component mounts THEN the system SHALL preload all three animation frame images
Thoughts: This is about performance optimization. On mount, all three images should be loaded into the browser cache. We can test by checking if Image objects are created with the correct src values.
Testable: yes - property

5.1 IF the generation API call fails THEN the system SHALL display a user-friendly error message
Thoughts: This is similar to 4.4. On API failure, a user-friendly message should be displayed. We can test by mocking an error and checking the error message content.
Testable: yes - property

5.2 WHEN an error occurs THEN the system SHALL provide a "Try Again" button to retry generation
Thoughts: This is part of 4.4. The retry button should be present in the error state. We can test by checking for the button in the error UI.
Testable: yes - property

5.3 WHEN an error occurs THEN the system SHALL log the error details for debugging
Thoughts: This is about logging behavior. Errors should be logged to the console. We can test by mocking console.error and verifying it was called.
Testable: yes - property

5.4 IF the generation takes longer than 30 seconds THEN the system SHALL continue showing the loading animation
Thoughts: This is about timeout behavior. The loading screen should remain visible even for long-running operations. We can test by mocking a delayed response beyond 30 seconds.
Testable: yes - property

5.5 WHEN the user clicks "Try Again" THEN the system SHALL restart the generation process and show the loading screen again
Thoughts: This is about retry behavior. Clicking retry should reset state and show the loading screen again. We can test by simulating the retry click.
Testable: yes - property

### Property Reflection

After reviewing all properties, the following redundancies were identified:

- **Property 2.5** is redundant with **Property 1.2** (both test cauldron centering)
- **Property 3.3** is redundant with **Property 2.4** (both test image-rendering: pixelated)
- **Property 5.1** overlaps significantly with **Property 4.4** (both test error message display)
- **Property 5.2** overlaps with **Property 4.4** (retry button is part of error handling)

These redundant properties will be consolidated in the final property list below.

### Correctness Properties

Property 1: Loading screen visibility on generate
*For any* wizard state where the generate button is clicked, the loading screen component should be rendered and visible
**Validates: Requirements 1.1, 4.2**

Property 2: Cauldron centering
*For any* loading screen render, the cauldron animation should be centered both horizontally and vertically on the screen
**Validates: Requirements 1.2, 2.5**

Property 3: Required text content
*For any* loading screen render, the text "Generating..." should be present in the DOM
**Validates: Requirements 1.3**

Property 4: Navigation to success screen
*For any* successful API response, the loading screen should be hidden and the success screen should be rendered with the correct download ID
**Validates: Requirements 1.4, 4.3**

Property 5: Navigation blocking
*For any* loading screen render, user navigation controls should be disabled or hidden to prevent navigation away
**Validates: Requirements 1.5**

Property 6: Animation frame cycling
*For any* loading screen display, the image src should cycle through loading_1.png, loading_2.png, loading_3.png in order
**Validates: Requirements 2.1**

Property 7: Frame rate consistency
*For any* frame transition in the animation, the duration between frames should be between 200ms and 400ms
**Validates: Requirements 2.2**

Property 8: Animation looping
*For any* loading screen display lasting longer than one animation cycle, the animation should restart from frame 1 after frame 3
**Validates: Requirements 2.3**

Property 9: Pixel art rendering
*For any* image element in the loading screen, the computed style should include image-rendering: pixelated or equivalent
**Validates: Requirements 2.4, 3.3**

Property 10: Dark background consistency
*For any* loading screen render, the background color should match the wizard's dark theme (e.g., bg-zinc-950 or similar)
**Validates: Requirements 3.1**

Property 11: Pixel font consistency
*For any* text element in the loading screen, the font-family should match the wizard's pixel font (Pixelify Sans or similar)
**Validates: Requirements 3.2**

Property 12: Sparkle effects presence
*For any* loading screen render, sparkle effect elements should be present in the DOM
**Validates: Requirements 3.4**

Property 13: API call initiation
*For any* generate button click, a fetch request to /api/generate should be initiated with the correct configuration
**Validates: Requirements 4.1**

Property 14: Error handling with retry
*For any* API error response, an error message should be displayed and a retry button should be available
**Validates: Requirements 4.4, 5.1, 5.2**

Property 15: Image preloading
*For any* loading screen component mount, all three animation frame images should be preloaded
**Validates: Requirements 4.5**

Property 16: Error logging
*For any* API error, the error details should be logged to the console
**Validates: Requirements 5.3**

Property 17: Long-running operation support
*For any* API call taking longer than 30 seconds, the loading screen should remain visible and continue animating
**Validates: Requirements 5.4**

Property 18: Retry functionality
*For any* retry button click in the error state, the generation process should restart and the loading screen should be displayed again
**Validates: Requirements 5.5**

## Error Handling

### API Errors

- **Network Errors**: Display "Network error. Please check your connection and try again."
- **Timeout Errors**: Display "Generation is taking longer than expected. Please try again."
- **Server Errors**: Display "Server error. Please try again later."
- **Validation Errors**: Display "Invalid configuration. Please check your selections."

### Animation Errors

- **Image Load Failures**: Fallback to simple spinner if animation frames fail to load
- **Performance Issues**: Reduce frame rate if animation causes performance problems

### State Management Errors

- **Hydration Mismatches**: Ensure loading screen only renders on client side
- **Race Conditions**: Prevent multiple simultaneous generation requests

## Testing Strategy

### Unit Tests

1. **Component Rendering**
   - Test GenerationLoadingScreen renders with correct structure
   - Test animation frame cycling logic
   - Test image preloading on mount
   - Test cleanup on unmount

2. **State Management**
   - Test ConfigurePage state transitions
   - Test handleGenerate function behavior
   - Test error state handling
   - Test retry functionality

3. **Integration Points**
   - Test PixelArtWizard onGenerate callback
   - Test API call initiation
   - Test navigation to success screen

### Property-Based Tests

Property-based tests will be implemented using **fast-check** (for TypeScript/React). Each test should run a minimum of 100 iterations.

1. **Property 1: Loading screen visibility** - Generate random wizard states, trigger generate, verify loading screen renders
2. **Property 4: Navigation to success** - Generate random API success responses, verify correct navigation
3. **Property 6: Animation frame cycling** - Generate random time intervals, verify frame order
4. **Property 7: Frame rate consistency** - Measure frame transitions, verify timing bounds
5. **Property 8: Animation looping** - Run animation for multiple cycles, verify restart behavior
6. **Property 13: API call initiation** - Generate random configs, verify API calls
7. **Property 14: Error handling** - Generate random error responses, verify error UI
8. **Property 18: Retry functionality** - Generate random error states, verify retry behavior

### Visual Regression Tests

- Capture screenshots of loading screen in different states
- Compare against baseline images
- Verify pixel art rendering quality
- Verify sparkle effects and glow effects

### Accessibility Tests

- Test keyboard navigation (should be blocked during loading)
- Test screen reader announcements
- Test ARIA labels and roles
- Test focus management

### Performance Tests

- Measure animation frame rate consistency
- Test memory usage during long-running animations
- Test image preloading impact on initial render
- Test cleanup to prevent memory leaks

## Implementation Notes

### Animation Implementation

Use `useEffect` with `setInterval` for frame cycling:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentFrame((prev) => (prev + 1) % ANIMATION_FRAMES.length);
  }, 300);
  
  return () => clearInterval(interval);
}, []);
```

### Image Preloading

Preload images on component mount to ensure smooth animation:

```typescript
useEffect(() => {
  ANIMATION_FRAMES.forEach((frame) => {
    const img = new Image();
    img.src = frame.src;
  });
}, []);
```

### Styling Approach

- Use Tailwind CSS for layout and spacing
- Use custom CSS for pixel art rendering
- Use existing wizard theme variables
- Maintain consistency with PixelArtWizard component

### Accessibility Considerations

- Add `role="status"` to loading screen
- Add `aria-live="polite"` for screen reader updates
- Add `aria-busy="true"` during generation
- Provide descriptive alt text for animation frames
- Announce generation start and completion

### Performance Optimizations

- Preload animation frames to prevent flicker
- Use CSS transforms for smooth animations
- Debounce rapid generate button clicks
- Clean up intervals and timeouts on unmount
- Use React.memo for loading screen component if needed
