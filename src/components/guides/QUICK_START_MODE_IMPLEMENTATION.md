# Quick Start Mode Implementation

## Overview

Quick Start Mode provides experienced developers with a condensed view of deployment guides, showing only essential commands and configuration while hiding detailed explanations, notes, and supplementary information. Users can expand individual steps to see full details when needed.

## Features Implemented

### 1. View Mode Toggle
- **Location**: `ViewModeToggle.tsx`
- **Functionality**: Allows users to switch between "Quick Start" and "Detailed Guide" modes
- **Persistence**: View mode preference is saved to localStorage via `GuideProgressManager`
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### 2. Conditional Content Display
- **Location**: `GuideStep.tsx`
- **Quick Start Mode Hides**:
  - Step descriptions (shown only when "Learn more" is clicked)
  - Notes sections
  - Warning sections
  - External links
  - Substep descriptions
  - Substep external links

- **Always Visible**:
  - Step titles and order
  - Required/optional badges
  - Commands with copy buttons
  - Code snippets
  - Substep titles
  - Substep commands

### 3. "Learn More" Expandable Details
- **Location**: `GuideStep.tsx` - `handleToggleDetails()` function
- **Functionality**: 
  - Shows a "Learn more about this step" button in Quick Start mode
  - Clicking reveals all hidden content for that specific step
  - Button changes to "Hide details" when content is expanded
  - Each step maintains its own expand/collapse state
  - State resets when switching back to Detailed mode

### 4. Enhanced User Guidance
- **Location**: `DeploymentGuide.tsx`
- **Functionality**: Introduction text adapts based on view mode
  - Quick Start: Explains that only essential commands are shown and how to expand details
  - Detailed: Explains that full information is provided

## Implementation Details

### State Management

```typescript
// GuideStep.tsx
const [showDetails, setShowDetails] = useState(false);

// Reset showDetails when view mode changes
useEffect(() => {
  if (viewMode === 'detailed') {
    setShowDetails(false);
  }
}, [viewMode]);
```

### Conditional Rendering Logic

```typescript
const isQuickStart = viewMode === 'quick-start';
const shouldShowDetails = !isQuickStart || showDetails;

// Use shouldShowDetails to conditionally render content
{shouldShowDetails && (
  <p className="text-sm text-gray-700 dark:text-gray-300">
    {step.description}
  </p>
)}
```

### Learn More Button

```typescript
{isQuickStart && (step.notes || step.warnings || step.description) && (
  <button
    onClick={handleToggleDetails}
    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold..."
    aria-label={showDetails ? "Hide detailed explanations" : "Show detailed explanations"}
    aria-expanded={showDetails}
  >
    <BookOpen size={16} />
    <span>{showDetails ? 'Hide details' : 'Learn more about this step'}</span>
  </button>
)}
```

## User Experience Flow

### Quick Start Mode
1. User selects "Quick Start" from view mode toggle
2. Guide displays only step titles and essential commands
3. For steps with additional content, a "Learn more" button appears
4. User clicks "Learn more" to expand details for specific steps
5. Expanded details remain visible until user clicks "Hide details" or switches to Detailed mode
6. View mode preference is saved and restored on next visit

### Detailed Guide Mode
1. User selects "Detailed Guide" from view mode toggle
2. All content is visible by default
3. No "Learn more" buttons appear
4. Users can still collapse/expand entire steps using the chevron button
5. View mode preference is saved and restored on next visit

## Accessibility Features

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper labels for screen readers
  - `aria-expanded` on "Learn more" button
  - `aria-label` describes button action
  - `role="radio"` on view mode toggle buttons
- **Focus Management**: Clear focus indicators on all interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmark regions

## Testing

### Manual Testing Checklist
- [ ] View mode toggle switches between modes correctly
- [ ] Quick Start mode hides descriptions, notes, warnings, and links
- [ ] "Learn more" button appears only in Quick Start mode
- [ ] Clicking "Learn more" reveals hidden content
- [ ] Button text changes to "Hide details" when expanded
- [ ] Commands and code snippets remain visible in both modes
- [ ] Substep descriptions are hidden in Quick Start mode
- [ ] View mode preference persists across page refreshes
- [ ] Switching modes doesn't lose step completion progress
- [ ] Keyboard navigation works for all interactive elements

### Test Component
Use `__test-quick-start-mode.tsx` to verify functionality:
- Demonstrates all Quick Start mode features
- Provides visual checklist of expected behaviors
- Shows sample step with all content types

## Requirements Satisfied

✅ **13.1**: Two view modes offered - "Quick Start" and "Detailed Guide"
✅ **13.2**: Quick Start displays only essential commands in condensed format
✅ **13.3**: Detailed Guide displays full explanations and context
✅ **13.4**: Switching between modes preserves progress
✅ **13.5**: "Learn more" buttons expand specific sections in Quick Start mode

## Future Enhancements

Potential improvements for future iterations:
1. Add animation transitions when expanding/collapsing details
2. Provide keyboard shortcuts for toggling view modes
3. Add "Expand all" / "Collapse all" buttons in Quick Start mode
4. Track which steps users expand most frequently for analytics
5. Add tooltips explaining what content is hidden in Quick Start mode
6. Consider adding a "Compact" mode between Quick Start and Detailed

## Related Files

- `src/components/guides/GuideStep.tsx` - Main step component with Quick Start logic
- `src/components/guides/ViewModeToggle.tsx` - View mode selector
- `src/components/guides/DeploymentGuide.tsx` - Main guide container
- `src/lib/deployment/guide-progress-manager.ts` - Persistence layer
- `src/components/guides/__test-quick-start-mode.tsx` - Test component
- `src/types/deployment-guides.ts` - Type definitions

## Performance Considerations

- **Minimal Re-renders**: State changes are localized to individual steps
- **Efficient Storage**: Only view mode preference is stored, not individual step expand states
- **No Network Calls**: All functionality is client-side
- **Lazy Rendering**: Hidden content is conditionally rendered, not just hidden with CSS

## Browser Compatibility

- **localStorage**: Supported in all modern browsers
- **CSS**: Uses standard Tailwind classes
- **JavaScript**: ES6+ features with Next.js transpilation
- **Accessibility**: WCAG 2.1 AA compliant
