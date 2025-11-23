# Wizard Performance Testing Guide

## Quick Start

1. Start the development server:
```bash
npm run dev
```

2. Open the wizard in your browser:
```
http://localhost:3000/configure
```

3. Open browser DevTools (F12 or Cmd+Option+I)

## Performance Tests

### 1. Visual Smoothness Test

**Steps:**
1. Navigate through all 8 wizard steps
2. Watch for smooth transitions (no jank or stuttering)
3. Observe the cauldron bubbling animation
4. Hover over navigation buttons
5. Hover over option cards

**Expected Results:**
- All transitions should be smooth
- Cauldron should bubble smoothly
- Hover effects should be instant
- No visual lag or stuttering

### 2. FPS Monitoring Test

**Steps:**
1. Open DevTools → Performance tab
2. Click "Record" button
3. Navigate through 2-3 wizard steps
4. Stop recording
5. Check the FPS graph

**Expected Results:**
- FPS should stay at or near 60fps
- Green bars in the FPS graph
- No red/yellow warnings

### 3. Automated Performance Test

**Steps:**
1. Open DevTools → Console tab
2. Run the following command:
```javascript
await window.wizardPerformanceTests.runAll()
```

**Expected Results:**
```
🎨 Wizard Performance Test Suite
  🧪 Testing wizard step transition performance...
  ✅ Step transitions running at optimal 60fps
  
  🧪 Testing cauldron animation performance...
  ✅ Cauldron animation running at optimal 60fps
  
  🧪 Testing navigation button performance...
  ✅ Navigation buttons running at optimal 60fps
  
  🧪 Testing option card performance...
  ✅ Option cards running at optimal 60fps
  
📊 Overall Performance Summary:
Average FPS: 60.0
✅ Excellent overall performance
```

### 4. Asset Size Test

**Steps:**
1. Open DevTools → Console tab
2. Run:
```javascript
await window.wizardPerformanceTests.checkAssets()
```

**Expected Results:**
```
📦 Checking asset sizes...
✅ /broom_stick.png: 13KB (under 200KB target)
✅ /ladle.png: 12KB (under 200KB target)
✅ /search_bar.png: 41KB (under 200KB target)
✅ /cauldron.png: 142KB (under 200KB target)
⚠️ /background_image.png: [size]KB (optimized via Next.js)
```

### 5. Network Performance Test

**Steps:**
1. Open DevTools → Network tab
2. Reload the page (Cmd+R or Ctrl+R)
3. Watch the asset loading

**Expected Results:**
- Background image should load as WebP (if browser supports)
- Assets should load quickly
- No failed requests
- Total page load < 3 seconds

### 6. Debounced Input Test

**Steps:**
1. Go to Step 1 (Project Name)
2. Open DevTools → Console tab
3. Type rapidly in the input field
4. Watch console for validation messages

**Expected Results:**
- Validation should not run on every keystroke
- Validation should run ~300ms after you stop typing
- UI should remain responsive while typing

### 7. Reduced Motion Test

**Steps:**
1. Enable "Reduce Motion" in your OS:
   - **macOS**: System Preferences → Accessibility → Display → Reduce motion
   - **Windows**: Settings → Ease of Access → Display → Show animations
   - **iOS**: Settings → Accessibility → Motion → Reduce Motion
2. Reload the wizard page
3. Navigate through steps

**Expected Results:**
- No animations should play
- Transitions should be instant
- Functionality should still work
- No visual glitches

## Browser Compatibility Test

Test in multiple browsers:

### Chrome/Edge
```bash
# Should work perfectly with all optimizations
```

### Safari
```bash
# Should work with WebP support
# Check for smooth animations
```

### Firefox
```bash
# Should work with all features
# Verify GPU acceleration
```

### Mobile Safari (iOS)
```bash
# Test on actual device or simulator
# Verify touch interactions
# Check animation performance
```

### Chrome Mobile (Android)
```bash
# Test on actual device or emulator
# Verify touch interactions
# Check animation performance
```

## Performance Benchmarks

### Target Metrics
- **FPS**: 60fps for all animations
- **Asset Load Time**: < 2 seconds on 3G
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 3 seconds
- **Lighthouse Performance Score**: > 85

### Running Lighthouse

**Steps:**
1. Open DevTools → Lighthouse tab
2. Select "Performance" category
3. Select "Desktop" or "Mobile"
4. Click "Analyze page load"

**Expected Results:**
- Performance score: > 85
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 300ms
- Cumulative Layout Shift: < 0.1

## Troubleshooting

### Low FPS

**Possible Causes:**
- Browser extensions interfering
- Other tabs consuming resources
- Hardware acceleration disabled
- Outdated browser

**Solutions:**
1. Disable browser extensions
2. Close other tabs
3. Enable hardware acceleration in browser settings
4. Update browser to latest version

### Assets Not Loading

**Possible Causes:**
- Network issues
- Next.js image optimization not working
- Asset paths incorrect

**Solutions:**
1. Check Network tab for errors
2. Verify Next.js dev server is running
3. Clear browser cache
4. Check asset paths in code

### Animations Stuttering

**Possible Causes:**
- GPU acceleration not working
- Too many animations running
- Browser performance issues

**Solutions:**
1. Check if GPU acceleration is enabled
2. Test in different browser
3. Check DevTools Performance tab for bottlenecks
4. Verify CSS optimizations are applied

## Additional Tests

### Memory Leak Test

**Steps:**
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Navigate through wizard multiple times
4. Take another heap snapshot
5. Compare snapshots

**Expected Results:**
- Memory should not grow significantly
- No detached DOM nodes
- No memory leaks

### CPU Usage Test

**Steps:**
1. Open Activity Monitor (macOS) or Task Manager (Windows)
2. Navigate through wizard
3. Watch CPU usage

**Expected Results:**
- CPU usage should be moderate
- No sustained high CPU usage
- CPU should drop when idle

## Reporting Issues

If you find performance issues:

1. Note the specific issue (e.g., "Step 3 transition stutters")
2. Record browser and OS version
3. Take screenshot or video
4. Check DevTools Performance tab
5. Run automated tests and share results
6. Report in GitHub issues or to development team

## Success Criteria

✅ All animations run at 60fps
✅ Assets load quickly (< 2 seconds)
✅ Input validation is debounced
✅ Reduced motion works correctly
✅ No console errors
✅ Lighthouse score > 85
✅ Works in all major browsers
✅ Smooth on mobile devices

If all criteria are met, performance optimizations are successful! 🎉
