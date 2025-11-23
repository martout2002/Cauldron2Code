# Flying Animation to Cauldron - Visual Demo Guide

## Quick Start

```bash
bun run dev
```

Navigate to: http://localhost:3000/configure

## Visual Demo Steps

### Step 1: Project Name
- Enter a project name (e.g., "my-awesome-app")
- Click "Next" → Simple fade transition (no flying animation for text input)

### Step 2: Description
- Enter a description
- Click "Next" → Simple fade transition

### Step 3: Frontend Framework ⭐ FLYING ANIMATION
- Select any framework (e.g., Next.js, React, Vue)
- Click "Next" → **Watch the magic!**
  - Selected card flies toward the cauldron
  - Card shrinks and fades during flight
  - Cauldron glows and splashes when card arrives
  - Next step appears after animation

### Step 4: Backend Framework ⭐ FLYING ANIMATION
- Select a backend option
- Click "Next" → Flying animation again!

### Step 5: Database ⭐ FLYING ANIMATION
- Select a database
- Click "Next" → Flying animation

### Step 6: Authentication ⭐ FLYING ANIMATION
- Select an auth provider
- Click "Next" → Flying animation

### Step 7: Styling ⭐ FLYING ANIMATION
- Select a styling solution
- Click "Next" → Flying animation

### Step 8: Extras
- Select extras (checkboxes)
- Click "Generate" → No flying animation (checkbox step)

## Animation Details

### What You'll See

**Flying Card:**
- Starts at the selected option's position
- Flies in a straight line to the cauldron center
- Shrinks from full size to 20% during flight
- Fades from fully visible to transparent
- Takes 800ms to complete

**Cauldron Splash:**
- Cauldron scales up to 115% at peak
- Brightness increases to 140%
- Green glow appears around cauldron
- Returns to normal state
- Takes 500ms to complete

### Timing Breakdown

```
0ms    - User clicks "Next"
0ms    - Flying animation starts
800ms  - Flying animation completes
800ms  - Cauldron splash starts
1300ms - Cauldron splash completes
1400ms - Step transition begins
1550ms - New step appears
```

## Testing Different Scenarios

### Test 1: Normal Animation
1. Navigate through wizard normally
2. Observe flying animation on each option-grid step
3. Verify smooth 60fps animation
4. Verify cauldron splash effect

### Test 2: Reduced Motion
1. Open DevTools (F12)
2. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
3. Type "Emulate CSS prefers-reduced-motion"
4. Select "prefers-reduced-motion: reduce"
5. Navigate through wizard
6. Verify NO flying animation (simple fade instead)

### Test 3: Mobile Viewport
1. Open DevTools
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Select iPhone 12 or similar
4. Navigate through wizard
5. Verify animation works on mobile

### Test 4: Different Frameworks
1. Go through wizard multiple times
2. Select different frameworks each time
3. Verify animation works for all options
4. Verify different card sizes animate correctly

### Test 5: Back Navigation
1. Navigate forward through wizard
2. Click "Back" button
3. Change selection
4. Click "Next" again
5. Verify animation still works

## Browser Console Testing

Open browser console and run:

```javascript
// Check if prefers-reduced-motion is enabled
window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Find the selected card
document.querySelector('.pixel-option-card.selected')

// Find the cauldron
document.querySelector('.cauldron-asset img')

// Manually trigger splash effect
const cauldron = document.querySelector('.cauldron-asset img');
cauldron.classList.add('cauldron-splash');
setTimeout(() => cauldron.classList.remove('cauldron-splash'), 500);
```

## Expected Visual Results

### ✅ Success Indicators
- [ ] Selected card flies smoothly to cauldron
- [ ] Card shrinks during flight
- [ ] Card fades out during flight
- [ ] Cauldron shows splash effect
- [ ] Animation is smooth (no jank)
- [ ] Next step appears after animation
- [ ] Animation skipped with reduced motion
- [ ] Works on mobile viewports

### ❌ Failure Indicators
- Card doesn't move
- Card jumps instead of flying smoothly
- Cauldron doesn't show splash
- Animation is janky or stutters
- Step transition happens before animation completes
- Animation blocks user interaction

## Performance Monitoring

### Check Animation Performance

1. Open DevTools
2. Go to Performance tab
3. Click Record
4. Navigate through wizard (trigger flying animation)
5. Stop recording
6. Check for:
   - 60fps frame rate
   - No long tasks
   - Smooth animation timeline

### Expected Performance
- Frame rate: 60fps
- Animation duration: 800ms
- No dropped frames
- GPU acceleration active (check Layers tab)

## Troubleshooting

### Animation Doesn't Trigger
**Possible Causes:**
- Not on an option-grid step
- No option selected
- Prefers-reduced-motion enabled
- JavaScript error in console

**Solutions:**
- Check browser console for errors
- Verify you're on a framework/database/auth/styling step
- Verify an option is selected (has green border)
- Check if reduced motion is enabled

### Animation Is Janky
**Possible Causes:**
- CPU throttling
- Other heavy operations running
- Browser extensions interfering

**Solutions:**
- Close other tabs
- Disable browser extensions
- Check DevTools Performance tab
- Try in incognito mode

### Cauldron Splash Doesn't Show
**Possible Causes:**
- CSS not loaded
- Class not being added
- Animation overridden

**Solutions:**
- Check if cauldron-splash class is in globals.css
- Verify class is added to cauldron element
- Check browser console for CSS errors

## Video Recording Tips

To record a demo video:

1. Use screen recording software (QuickTime, OBS, etc.)
2. Set viewport to 1920x1080 for best quality
3. Navigate slowly through wizard
4. Pause briefly after each animation
5. Show both normal and reduced-motion modes
6. Show mobile viewport

## Sharing Feedback

When sharing feedback, please include:
- Browser and version
- Operating system
- Screen size / viewport
- Whether reduced motion is enabled
- Screenshot or video of the issue
- Browser console errors (if any)

## Next Steps

After testing, you can:
1. Adjust animation timing in PixelArtWizard.tsx
2. Modify splash effect in globals.css
3. Add more sparkle effects
4. Customize easing curves
5. Add sound effects (future enhancement)

Enjoy the magical flying animation! ✨🧙‍♀️
