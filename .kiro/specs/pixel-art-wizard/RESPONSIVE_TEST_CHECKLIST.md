# Responsive Design Test Checklist

## Quick Visual Testing Guide

### How to Test
1. Start the development server: `npm run dev`
2. Navigate to `/configure`
3. Use browser DevTools to test different viewport sizes
4. Test on actual devices if available

## Mobile Testing (< 640px)

### iPhone SE (375px)
- [ ] Step indicator is visible and readable at top
- [ ] Navigation buttons (Back/Next) are 40px and easily tappable
- [ ] Cauldron is 80px and centered
- [ ] Input field is touch-friendly (min 44px height)
- [ ] Option cards display in 2-column grid
- [ ] Checkbox cards display in single column
- [ ] All text is readable (no text too small)
- [ ] No horizontal scrolling
- [ ] Bottom navigation doesn't overlap content

### iPhone 12/13/14 (390px)
- [ ] All elements scale appropriately
- [ ] Grid layouts work correctly
- [ ] Touch targets are adequate
- [ ] Typography is comfortable to read

### Landscape Mobile (< 896px landscape)
- [ ] Vertical spacing is reduced appropriately
- [ ] Cauldron is 64px (smaller for limited height)
- [ ] Navigation buttons are 36px
- [ ] Content fits without excessive scrolling
- [ ] All interactive elements remain accessible

## Tablet Testing (640px - 1024px)

### iPad (768px)
- [ ] Step indicator is medium-sized
- [ ] Navigation buttons are 56px
- [ ] Cauldron is 120px
- [ ] Option cards display in 2-3 columns
- [ ] Checkbox cards display in 2 columns
- [ ] Typography scales to medium size
- [ ] Hover effects work (if using mouse)

### iPad Pro (1024px)
- [ ] Layout transitions smoothly to desktop
- [ ] All spacing is appropriate
- [ ] Grid layouts are balanced

## Desktop Testing (> 1024px)

### Standard Desktop (1920px)
- [ ] Navigation buttons are 64px with full hover effects
- [ ] Cauldron is 192px (full size)
- [ ] Option cards display in full 3-column grid
- [ ] Content is centered with max-width
- [ ] Hover effects (scale, glow) work smoothly
- [ ] Typography is at full size

### Large Desktop (2560px)
- [ ] Content doesn't appear too small
- [ ] Max-width constraints work correctly
- [ ] Layout remains centered

## Touch Interaction Testing

### On Touch Devices
- [ ] All buttons have min 44x44px touch targets
- [ ] Hover effects don't interfere with touch
- [ ] Active states provide tactile feedback
- [ ] No unwanted tap highlighting
- [ ] Input fields work with on-screen keyboard
- [ ] Keyboard doesn't obscure important content

## Cross-Browser Testing

### Chrome
- [ ] Mobile viewport emulation works
- [ ] Desktop layout renders correctly
- [ ] Animations are smooth

### Safari (iOS)
- [ ] Touch interactions work correctly
- [ ] Fonts render properly
- [ ] Animations perform well

### Firefox
- [ ] Layout is consistent
- [ ] Responsive breakpoints work

### Edge
- [ ] Desktop layout works
- [ ] No rendering issues

## Specific Component Tests

### Step Indicator
- [ ] Mobile: Full-width, small text (0.75rem)
- [ ] Tablet: Medium size (0.9375rem)
- [ ] Desktop: Standard size (1rem)
- [ ] Always visible and readable

### Navigation Buttons
- [ ] Mobile: 40px icons, 0.875rem text
- [ ] Tablet: 56px icons, 1.125rem text
- [ ] Desktop: 64px icons, 1.25rem text
- [ ] Disabled state is clear
- [ ] Touch-friendly on mobile

### Cauldron Asset
- [ ] Mobile: 80px
- [ ] Tablet: 120px
- [ ] Desktop: 192px
- [ ] Landscape mobile: 64px
- [ ] Always centered
- [ ] Animation works smoothly

### Input Fields
- [ ] Mobile: Comfortable text size (1rem)
- [ ] Icon scales appropriately
- [ ] Touch-friendly height
- [ ] Error messages are readable
- [ ] Works with on-screen keyboard

### Option Grid
- [ ] Mobile: 2 columns (or 1 for narrow configs)
- [ ] Tablet: 2-3 columns
- [ ] Desktop: Full column count
- [ ] Cards are touch-friendly
- [ ] Icons scale appropriately
- [ ] Selected state is clear

### Checkbox Group
- [ ] Mobile: Single column
- [ ] Tablet/Desktop: 2 columns
- [ ] Checkboxes are touch-friendly
- [ ] Labels are readable
- [ ] Selected state is clear

## Performance Tests

### Animation Performance
- [ ] Step transitions are smooth (no jank)
- [ ] Cauldron bubble animation runs at 60fps
- [ ] Hover effects don't cause lag
- [ ] No layout shifts during animations

### Loading Performance
- [ ] Images load efficiently
- [ ] No flash of unstyled content
- [ ] Responsive images load appropriate sizes
- [ ] Page is interactive quickly

### Network Performance
- [ ] Test on slow 3G connection
- [ ] Assets load progressively
- [ ] No blocking resources

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Arrow keys work for navigation
- [ ] Enter/Space activate buttons

### Screen Reader
- [ ] Step changes are announced
- [ ] All interactive elements have labels
- [ ] Error messages are announced
- [ ] Semantic HTML is maintained

### Zoom Testing
- [ ] Test at 200% zoom
- [ ] Layout doesn't break
- [ ] Text remains readable
- [ ] No horizontal scrolling

## Common Issues to Check

- [ ] No text is cut off or truncated
- [ ] No overlapping elements
- [ ] No horizontal scrolling on any viewport
- [ ] Navigation buttons don't overlap content
- [ ] Step indicator doesn't overlap title
- [ ] Input fields don't extend beyond viewport
- [ ] Grid layouts don't break
- [ ] Images maintain aspect ratio
- [ ] Animations don't cause layout shifts
- [ ] Touch targets are adequate (min 44x44px)

## Sign-Off

### Tested By: _______________
### Date: _______________
### Devices Tested:
- [ ] iPhone (iOS)
- [ ] Android Phone
- [ ] iPad
- [ ] Desktop (Chrome)
- [ ] Desktop (Safari)
- [ ] Desktop (Firefox)

### Issues Found: _______________
### Status: _______________
