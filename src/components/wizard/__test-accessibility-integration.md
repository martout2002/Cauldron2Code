# Accessibility Integration Test

## Purpose
Verify that accessibility attributes work correctly when OptionGrid is integrated with the wizard flow.

## Test Scenario

### Setup
1. Navigate to the configuration wizard
2. Select "Next.js" as the frontend framework
3. Navigate to the backend framework step

### Expected Behavior

#### Visual Verification
- Express, Fastify, and NestJS options should appear with reduced opacity (40%)
- These options should have a "not-allowed" cursor
- Hovering over them should NOT trigger scale animation
- Hovering should show red tooltip with incompatibility message

#### DOM Verification (DevTools)
For each disabled backend option (Express, Fastify, NestJS):

```html
<div>
  <!-- Hidden description for screen readers -->
  <div 
    id="option-desc-express" 
    class="sr-only"
    role="status"
    aria-live="polite"
  >
    Express cannot be used with Next.js. Next.js has its own API routes. Use "Next.js API" or select a different frontend.
  </div>
  
  <!-- Button with accessibility attributes -->
  <button
    role="radio"
    aria-checked="false"
    aria-label="Express, Fast, unopinionated web framework"
    aria-disabled="true"
    aria-describedby="option-desc-express"
    tabindex="0"
    class="... opacity-40 cursor-not-allowed"
  >
    <!-- Button content -->
  </button>
</div>
```

#### Keyboard Navigation Verification
1. Press Tab to focus on Express option
2. Verify focus ring appears (option is focusable)
3. Press Enter or Space
4. Verify Express is NOT selected (no checkmark appears)
5. Verify no console error or selection event
6. Press Arrow Right to move to next option
7. Verify navigation works normally

#### Screen Reader Verification (VoiceOver on macOS)
1. Enable VoiceOver: Cmd + F5
2. Navigate to backend step
3. Use VO + Right Arrow to move through options
4. When on Express option, VoiceOver should announce:
   - "Express"
   - "radio button"
   - "dimmed" or "disabled"
   - "Express cannot be used with Next.js. Next.js has its own API routes. Use Next.js API or select a different frontend."

#### State Change Verification
1. Navigate back to frontend step
2. Change selection from "Next.js" to "React"
3. Navigate forward to backend step
4. Verify Express, Fastify, NestJS are now ENABLED
5. Verify aria-disabled is now "false" or removed
6. Verify aria-describedby is removed
7. Verify hidden description elements are removed from DOM

## Success Criteria

- [x] Disabled options have aria-disabled="true"
- [x] Hidden description elements exist with correct IDs
- [x] aria-describedby links to correct description
- [x] Disabled options remain focusable (tabIndex=0)
- [x] Enter/Space on disabled options does NOT select them
- [x] Screen readers announce incompatibility reasons
- [x] ARIA attributes update when state changes
- [x] No console errors or warnings
- [x] Keyboard navigation works smoothly
- [x] Visual styling matches accessibility state

## Notes

### Why aria-disabled instead of disabled attribute?
- The `disabled` attribute removes elements from tab order
- We want disabled options to remain focusable for accessibility
- Users need to be able to focus on disabled options to hear why they're disabled
- `aria-disabled` provides semantic information without affecting focusability

### Why sr-only instead of display:none?
- `display:none` removes elements from accessibility tree
- `sr-only` hides visually but keeps in accessibility tree
- Screen readers can still read sr-only content
- This allows screen reader users to understand incompatibilities

### Why aria-live="polite"?
- Announces changes without interrupting current speech
- When disabled state changes, screen readers will announce the new state
- "polite" is less intrusive than "assertive"
- Appropriate for non-critical status updates

## Related Requirements

- Requirement 4.1: aria-disabled attribute
- Requirement 4.2: Hidden descriptions with aria-describedby
- Requirement 4.3: Focusable disabled options, prevent selection
- Requirement 4.4: Immediate ARIA updates
- Requirement 4.5: Complete accessibility tree information
