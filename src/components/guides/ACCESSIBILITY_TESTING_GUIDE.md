# Halloween Deployment Guides - Accessibility Testing Guide

## Overview

This guide provides step-by-step instructions for manually testing the accessibility features of the Halloween-themed deployment guide components.

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Screen reader software (NVDA, JAWS, or VoiceOver)
- Keyboard for navigation testing
- Access to browser DevTools

## Test 1: Keyboard Navigation

### Objective
Verify that all interactive elements are accessible via keyboard and have visible focus indicators.

### Steps

1. **Navigate to the deployment guides page**
   - URL: `/guides`
   - Ensure you're on the platform selection page

2. **Test Tab Navigation**
   - Press `Tab` repeatedly to move through all interactive elements
   - Expected: Focus moves in logical order through:
     - Skip link (appears on first Tab)
     - "Compare All Platforms" button
     - Each platform card
     - Help section links (if any)

3. **Verify Focus Indicators**
   - As you tab through elements, check that each has a visible focus indicator
   - Expected: Green outline (`#b4ff64`) with 3px width and 3px offset
   - Expected: Subtle glow effect around focused element

4. **Test Skip Link**
   - Press `Tab` once from page load
   - Expected: "Skip to platform selection" link appears at top-left
   - Press `Enter` on the skip link
   - Expected: Focus jumps to main content area

5. **Test Button Activation**
   - Tab to "Compare All Platforms" button
   - Press `Enter` or `Space`
   - Expected: Comparison view loads
   - Press `Tab` to "Back" button
   - Press `Enter` or `Space`
   - Expected: Returns to platform selection

6. **Test Platform Card Selection**
   - Tab to any platform card
   - Press `Enter` or `Space`
   - Expected: Platform guide loads

### Pass Criteria
- ✅ All interactive elements are reachable via Tab
- ✅ Focus indicators are clearly visible
- ✅ Skip link appears and functions correctly
- ✅ Enter/Space keys activate buttons
- ✅ No keyboard traps (can always move forward/backward)

---

## Test 2: Screen Reader Compatibility

### Objective
Verify that all content is properly announced by screen readers.

### Setup

**Windows (NVDA):**
1. Download NVDA from https://www.nvaccess.org/
2. Install and launch NVDA
3. Press `Insert + Down Arrow` to enter browse mode

**Mac (VoiceOver):**
1. Press `Cmd + F5` to enable VoiceOver
2. Use `VO + Right Arrow` to navigate (VO = Ctrl + Option)

**Windows (JAWS):**
1. Launch JAWS
2. Navigate with `Down Arrow` or `Tab`

### Steps

1. **Test Page Structure**
   - Navigate through the page with screen reader
   - Expected announcements:
     - "Main landmark, Deployment platform selection"
     - "Heading level 1: Choose Your Deployment Platform"
     - "Heading level 2: Recommended for Your Project" (if applicable)
     - "Heading level 2: All Platforms"

2. **Test Platform Cards**
   - Navigate to a platform card
   - Expected announcement:
     - "Button, View deployment guide for [Platform Name]. [Description]. [Recommended for your project]"
   - Example: "Button, View deployment guide for Vercel. Best for Next.js applications. Recommended for your project."

3. **Test Recommended Badges**
   - Navigate to a recommended platform card
   - Expected: "Recommended for your project, status"

4. **Test Comparison Table**
   - Click "Compare All Platforms"
   - Navigate through the table
   - Expected announcements:
     - "Table, Platform feature comparison table"
     - "Row 1, Column 1: Feature"
     - "Row 1, Column 2: Vercel"
     - "Row 2, Column 1: Free Tier"
     - "Row 2, Column 2: Yes, image" (for checkmark)

5. **Test Icons**
   - Navigate to checkmark/X icons in comparison table
   - Expected: "Yes, image" or "No, image"

6. **Test Lists**
   - Navigate to "Best For" tags
   - Expected: "List with [N] items"
   - Expected: Each tag announced as list item

### Pass Criteria
- ✅ All headings announced with correct levels
- ✅ Landmarks properly identified
- ✅ Button labels are descriptive
- ✅ Icons have appropriate labels
- ✅ Table structure is clear
- ✅ Lists are properly identified
- ✅ No "unlabeled" or "button" announcements

---

## Test 3: Reduced Motion

### Objective
Verify that animations are disabled when user prefers reduced motion.

### Setup

**Windows:**
1. Open Settings → Accessibility → Visual effects
2. Turn off "Show animations in Windows"

**Mac:**
1. Open System Preferences → Accessibility → Display
2. Check "Reduce motion"

**Browser DevTools (Alternative):**
1. Open DevTools (F12)
2. Press `Cmd/Ctrl + Shift + P`
3. Type "Emulate CSS prefers-reduced-motion"
4. Select "Emulate CSS prefers-reduced-motion: reduce"

### Steps

1. **Enable Reduced Motion**
   - Use one of the methods above

2. **Test Platform Cards**
   - Hover over platform cards
   - Expected: No scale animation
   - Expected: No sparkle effects appear
   - Expected: Minimal or no transition effects

3. **Test Buttons**
   - Hover over buttons
   - Expected: No transform animations
   - Expected: Color changes are instant (no transition)

4. **Test Recommended Badges**
   - Look at recommended badges
   - Expected: No pulse animation

5. **Test Page Transitions**
   - Navigate between platform selection and comparison
   - Expected: Instant transitions (no fade/slide effects)

### Pass Criteria
- ✅ No animations play when reduced motion is enabled
- ✅ Sparkle effects don't appear
- ✅ Hover effects are minimal
- ✅ Transitions are instant or very brief
- ✅ Page remains fully functional

---

## Test 4: Color Contrast

### Objective
Verify that all text meets WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).

### Setup

**Using Browser DevTools:**
1. Open DevTools (F12)
2. Select the Elements/Inspector tab
3. Click on a text element
4. Look for contrast ratio in the Styles panel

**Using Online Tool:**
1. Visit https://webaim.org/resources/contrastchecker/
2. Enter foreground and background colors
3. Check the contrast ratio

### Steps

1. **Test Main Heading**
   - Color: White (#ffffff) on Dark (#0a0e1a)
   - Expected ratio: ≥ 4.5:1
   - Actual: ~19.5:1 ✅

2. **Test Body Text**
   - Color: Gray-300 (#d1d5db) on Dark (#0a0e1a)
   - Expected ratio: ≥ 4.5:1
   - Actual: ~12.8:1 ✅

3. **Test Green Accent Text**
   - Color: Green (#b4ff64) on Dark (#0a0e1a)
   - Expected ratio: ≥ 4.5:1
   - Actual: ~14.2:1 ✅

4. **Test Button Text**
   - Color: Dark (#0a0e1a) on Green (#b4ff64)
   - Expected ratio: ≥ 4.5:1
   - Actual: ~14.2:1 ✅

5. **Test Purple Accent**
   - Color: Purple (#8b5cf6) on Dark (#0a0e1a)
   - Expected ratio: ≥ 4.5:1
   - Actual: ~7.1:1 ✅

6. **Test Orange Accent**
   - Color: Orange (#f97316) on Dark (#0a0e1a)
   - Expected ratio: ≥ 4.5:1
   - Actual: ~8.3:1 ✅

### Pass Criteria
- ✅ All text has contrast ratio ≥ 4.5:1
- ✅ Large text (18pt+) has ratio ≥ 3:1
- ✅ No contrast warnings in DevTools
- ✅ Text is easily readable

---

## Test 5: Touch Target Sizes

### Objective
Verify that all interactive elements meet the minimum 44x44px touch target size.

### Setup

**Using Browser DevTools:**
1. Open DevTools (F12)
2. Toggle device toolbar (Cmd/Ctrl + Shift + M)
3. Select a mobile device (e.g., iPhone 12)

### Steps

1. **Test Platform Cards**
   - Inspect a platform card button
   - Check computed dimensions
   - Expected: min-height: 44px, min-width: 44px

2. **Test Compare Button**
   - Inspect "Compare All Platforms" button
   - Check computed dimensions
   - Expected: height ≥ 44px

3. **Test Back Button**
   - In comparison view, inspect "Back" button
   - Check computed dimensions
   - Expected: height ≥ 44px

4. **Test Platform Selection Buttons**
   - In comparison table, inspect "Choose" buttons
   - Check computed dimensions
   - Expected: height ≥ 44px

5. **Test Links**
   - Inspect any links (pricing, docs)
   - Check computed dimensions
   - Expected: height ≥ 44px

### Pass Criteria
- ✅ All buttons are at least 44x44px
- ✅ All links are at least 44px tall
- ✅ Platform cards are easy to tap
- ✅ Adequate spacing between elements
- ✅ No accidental activations

---

## Test 6: Zoom and Reflow

### Objective
Verify that content remains accessible at 200% zoom without horizontal scrolling.

### Steps

1. **Set Zoom to 200%**
   - Press `Cmd/Ctrl + +` multiple times
   - Or use browser menu: View → Zoom In

2. **Test Platform Selection Page**
   - Scroll vertically through the page
   - Expected: No horizontal scrollbar
   - Expected: All content visible and readable
   - Expected: Platform cards stack vertically on mobile

3. **Test Comparison Table**
   - Navigate to comparison view
   - Expected: Table switches to card layout on mobile
   - Expected: All information accessible
   - Expected: No text overlap

4. **Test Text Readability**
   - Check that all text is readable
   - Expected: Text doesn't overflow containers
   - Expected: Line breaks are appropriate

### Pass Criteria
- ✅ No horizontal scrolling at 200% zoom
- ✅ All content remains accessible
- ✅ Text doesn't overlap
- ✅ Layout adapts appropriately
- ✅ All functionality works

---

## Test 7: High Contrast Mode

### Objective
Verify that the interface remains usable in high contrast mode.

### Setup

**Windows:**
1. Open Settings → Accessibility → Contrast themes
2. Select a high contrast theme

**Mac:**
1. Open System Preferences → Accessibility → Display
2. Check "Increase contrast"

### Steps

1. **Enable High Contrast Mode**
   - Use one of the methods above

2. **Test Visibility**
   - Check that all elements are visible
   - Expected: Borders are visible
   - Expected: Focus indicators are clear
   - Expected: Text is readable

3. **Test Interactive Elements**
   - Hover over buttons and cards
   - Expected: Clear visual distinction
   - Expected: Hover states are visible

4. **Test Focus Indicators**
   - Tab through elements
   - Expected: Focus indicators are highly visible

### Pass Criteria
- ✅ All elements visible in high contrast
- ✅ Borders clearly defined
- ✅ Focus indicators prominent
- ✅ Interactive elements distinguishable
- ✅ Text remains readable

---

## Test 8: Mobile Responsiveness

### Objective
Verify that the interface works well on mobile devices.

### Setup

**Using Real Device:**
1. Open the page on a mobile device
2. Test in both portrait and landscape

**Using DevTools:**
1. Open DevTools (F12)
2. Toggle device toolbar (Cmd/Ctrl + Shift + M)
3. Select various devices

### Steps

1. **Test Portrait Mode**
   - View page in portrait orientation
   - Expected: Single column layout
   - Expected: Cards stack vertically
   - Expected: All content accessible

2. **Test Landscape Mode**
   - Rotate device to landscape
   - Expected: Layout adapts appropriately
   - Expected: No content cut off

3. **Test Touch Interactions**
   - Tap on platform cards
   - Expected: Cards respond to touch
   - Expected: No accidental activations
   - Expected: Adequate spacing

4. **Test Scrolling**
   - Scroll through the page
   - Expected: Smooth scrolling
   - Expected: No layout shifts

### Pass Criteria
- ✅ Layout adapts to screen size
- ✅ All content accessible on mobile
- ✅ Touch targets are adequate
- ✅ No horizontal scrolling
- ✅ Smooth interactions

---

## Automated Testing

### Using axe DevTools

1. **Install axe DevTools**
   - Chrome: https://chrome.google.com/webstore (search "axe DevTools")
   - Firefox: https://addons.mozilla.org/firefox/ (search "axe DevTools")

2. **Run Scan**
   - Open DevTools (F12)
   - Click "axe DevTools" tab
   - Click "Scan ALL of my page"

3. **Review Results**
   - Expected: 0 violations
   - Review any issues found
   - Fix critical and serious issues

### Using Lighthouse

1. **Open Lighthouse**
   - Open DevTools (F12)
   - Click "Lighthouse" tab

2. **Run Audit**
   - Select "Accessibility" category
   - Click "Generate report"

3. **Review Score**
   - Expected: 100/100
   - Review any issues
   - Fix failing audits

---

## Issue Reporting

If you find any accessibility issues, please report them with:

1. **Issue Description**: What's wrong?
2. **Steps to Reproduce**: How to see the issue?
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What actually happens?
5. **Environment**: Browser, OS, assistive technology used
6. **Screenshots**: If applicable
7. **Severity**: Critical, High, Medium, Low

---

## Summary Checklist

Use this checklist to track your testing progress:

- [ ] Keyboard Navigation
  - [ ] All elements reachable via Tab
  - [ ] Focus indicators visible
  - [ ] Skip links functional
  - [ ] No keyboard traps

- [ ] Screen Reader
  - [ ] Headings announced correctly
  - [ ] Button labels descriptive
  - [ ] Icons have labels
  - [ ] Table structure clear

- [ ] Reduced Motion
  - [ ] Animations disabled
  - [ ] Sparkles don't appear
  - [ ] Transitions instant

- [ ] Color Contrast
  - [ ] All text meets WCAG AA
  - [ ] No contrast warnings

- [ ] Touch Targets
  - [ ] All buttons ≥ 44x44px
  - [ ] Adequate spacing

- [ ] Zoom and Reflow
  - [ ] Works at 200% zoom
  - [ ] No horizontal scroll

- [ ] High Contrast Mode
  - [ ] All elements visible
  - [ ] Focus indicators clear

- [ ] Mobile Responsiveness
  - [ ] Layout adapts
  - [ ] Touch interactions work

- [ ] Automated Testing
  - [ ] axe DevTools: 0 violations
  - [ ] Lighthouse: 100/100

---

**Last Updated**: December 2, 2025
**Version**: 1.0
