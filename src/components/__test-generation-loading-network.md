# Generation Loading Screen - Network Condition Testing Guide

## Task 20: Network Condition Testing

This guide provides instructions for testing the GenerationLoadingScreen under various network conditions.

### Testing Setup

#### Chrome DevTools Network Throttling

1. Open Chrome DevTools (F12)
2. Go to the Network tab
3. Click the "No throttling" dropdown
4. Select a network profile or create a custom one

#### Available Profiles

- **Fast 3G**: 1.6 Mbps down, 750 Kbps up, 562ms latency
- **Slow 3G**: 400 Kbps down, 400 Kbps up, 2000ms latency
- **Offline**: No network connection

### Test Scenarios

#### Scenario 1: Fast Connection (No Throttling)

**Expected Behavior**:
- Loading screen appears immediately when Generate is clicked
- All three animation frames preload quickly (< 100ms)
- Animation starts smoothly without delay
- Cauldron cycles through frames at 300ms intervals
- Sparkle effects animate properly
- API call completes quickly
- Smooth transition to success screen

**Test Steps**:
1. Ensure network throttling is disabled
2. Complete wizard configuration
3. Click "Generate" button
4. Observe loading screen appearance
5. Monitor animation smoothness
6. Verify transition to success screen

**Pass Criteria**:
- ✓ Loading screen appears within 50ms of button click
- ✓ No visible image loading delay
- ✓ Animation is smooth and consistent
- ✓ No flicker or jank

---

#### Scenario 2: Slow 3G Connection

**Expected Behavior**:
- Loading screen appears immediately (before images load)
- Animation frames may load progressively
- Animation continues even if images are still loading
- No broken image icons
- Fallback behavior if images fail to load
- API call takes longer but loading screen remains visible
- Smooth transition to success screen after API completes

**Test Steps**:
1. Enable "Slow 3G" throttling in DevTools
2. Clear browser cache (to force image reloading)
3. Complete wizard configuration
4. Click "Generate" button
5. Observe loading screen behavior during image loading
6. Monitor animation during slow API call
7. Verify transition to success screen

**Pass Criteria**:
- ✓ Loading screen appears immediately (not waiting for images)
- ✓ Animation starts even with slow image loading
- ✓ No broken image icons or error states
- ✓ Loading screen remains visible during entire API call
- ✓ Animation continues smoothly for 30+ seconds if needed

---

#### Scenario 3: Offline/Network Error

**Expected Behavior**:
- Loading screen appears when Generate is clicked
- Images may fail to load (cached images may work)
- API call fails with network error
- Loading screen hides
- Error message is displayed
- User can retry generation

**Test Steps**:
1. Enable "Offline" mode in DevTools
2. Complete wizard configuration
3. Click "Generate" button
4. Observe loading screen behavior
5. Wait for API call to fail
6. Verify error message appears
7. Test retry functionality

**Pass Criteria**:
- ✓ Loading screen appears (may show without images if not cached)
- ✓ API error is caught and handled gracefully
- ✓ Loading screen hides when error occurs
- ✓ User-friendly error message is displayed
- ✓ "Try Again" button is available
- ✓ Retry restarts the generation process

---

#### Scenario 4: Intermittent Connection

**Expected Behavior**:
- Loading screen handles connection drops gracefully
- Animation continues during connection issues
- API timeout is handled appropriately
- Error recovery works correctly

**Test Steps**:
1. Start with normal connection
2. Click "Generate" button
3. Toggle offline mode during API call
4. Observe error handling
5. Re-enable connection and retry

**Pass Criteria**:
- ✓ Loading screen remains stable during connection changes
- ✓ Timeout errors are caught and displayed
- ✓ Retry functionality works after connection is restored

---

#### Scenario 5: Very Slow API Response (30+ seconds)

**Expected Behavior**:
- Loading screen continues to display
- Animation loops continuously
- No timeout errors (unless server times out)
- User sees consistent feedback
- Eventually completes or shows error

**Test Steps**:
1. Enable "Slow 3G" throttling
2. Click "Generate" button
3. Observe loading screen for extended period
4. Monitor animation consistency
5. Verify eventual completion or timeout

**Pass Criteria**:
- ✓ Loading screen remains visible for 30+ seconds
- ✓ Animation continues smoothly without degradation
- ✓ No memory leaks or performance issues
- ✓ User receives feedback when process completes or times out

---

### Image Preloading Tests

#### Test 1: Verify Preloading Occurs

**Steps**:
1. Open DevTools Network tab
2. Clear cache
3. Navigate to wizard
4. Click "Generate" button
5. Check Network tab for image requests

**Expected**:
- Three image requests for loading_1.png, loading_2.png, loading_3.png
- Images load in parallel
- Images are cached for subsequent frames

#### Test 2: Verify Fallback on Preload Failure

**Steps**:
1. Block image requests using DevTools
2. Click "Generate" button
3. Observe loading screen behavior

**Expected**:
- Console warnings for failed preloads
- Loading screen still displays
- Animation attempts to continue (may show broken images)
- No JavaScript errors

---

### Performance Monitoring

#### Metrics to Track

1. **Time to First Paint**: How quickly loading screen appears
2. **Image Load Time**: How long to preload all frames
3. **Animation Frame Rate**: Consistency of 300ms intervals
4. **Memory Usage**: Check for leaks during long animations
5. **CPU Usage**: Ensure animation doesn't cause high CPU usage

#### Chrome DevTools Performance Tab

1. Start recording
2. Click "Generate" button
3. Let animation run for 10-15 seconds
4. Stop recording
5. Analyze:
   - Frame rate consistency
   - JavaScript execution time
   - Memory allocation
   - Paint operations

**Target Metrics**:
- Time to First Paint: < 100ms
- Image Load Time: < 500ms (fast connection)
- Animation Frame Rate: Consistent 300ms ± 50ms
- Memory Usage: Stable (no continuous growth)
- CPU Usage: < 10% on modern hardware

---

### Automated Network Testing

You can use the following script to test network conditions programmatically:

```javascript
// In browser console or test file

// Simulate slow network
async function testSlowNetwork() {
  console.log('Testing with slow network...');
  
  // Override fetch to add delay
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay
    return originalFetch(...args);
  };
  
  // Trigger generation
  // ... test code ...
  
  // Restore fetch
  window.fetch = originalFetch;
}

// Simulate network error
async function testNetworkError() {
  console.log('Testing network error...');
  
  const originalFetch = window.fetch;
  window.fetch = async () => {
    throw new Error('Network error');
  };
  
  // Trigger generation
  // ... test code ...
  
  // Restore fetch
  window.fetch = originalFetch;
}
```

---

### Test Results Template

**Date**: ___________
**Tester**: ___________
**Browser**: ___________
**Connection**: ___________

| Scenario | Pass/Fail | Notes |
|----------|-----------|-------|
| Fast Connection | ☐ | |
| Slow 3G | ☐ | |
| Offline | ☐ | |
| Intermittent | ☐ | |
| Long API Response | ☐ | |
| Image Preloading | ☐ | |
| Performance | ☐ | |

**Issues Found**:
1. [Issue description]
2. [Issue description]

**Recommendations**:
1. [Recommendation]
2. [Recommendation]
