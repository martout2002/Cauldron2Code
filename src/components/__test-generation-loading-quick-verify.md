# Generation Loading Screen - Quick Verification Script

## 5-Minute Smoke Test

Use this quick checklist to verify the loading screen is working correctly.

---

## 🚀 Quick Start

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: Navigate to `http://localhost:3000/configure`

3. **Follow the steps below** (should take ~5 minutes)

---

## ✅ Quick Verification Steps

### Step 1: Basic Rendering (30 seconds)
- [ ] Complete wizard with any valid configuration
- [ ] Click "Generate" button
- [ ] **Verify**: Loading screen appears immediately
- [ ] **Verify**: Dark background (zinc-950)
- [ ] **Verify**: Cauldron animation is visible
- [ ] **Verify**: "Generating..." text is visible below cauldron

**Status**: ☐ Pass ☐ Fail

---

### Step 2: Animation Check (30 seconds)
- [ ] Watch the cauldron animation for 10 seconds
- [ ] **Verify**: Animation cycles through 3 different frames
- [ ] **Verify**: Animation loops continuously (frame 1 → 2 → 3 → 1)
- [ ] **Verify**: Animation is smooth (no stuttering)
- [ ] **Verify**: Frame changes approximately every 300ms

**Status**: ☐ Pass ☐ Fail

---

### Step 3: Sparkle Effects (15 seconds)
- [ ] Observe the area around the cauldron
- [ ] **Verify**: Four sparkle effects are visible
- [ ] **Verify**: Sparkles are positioned in corners (top-left, top-right, bottom-left, bottom-right)
- [ ] **Verify**: Sparkles pulse/animate
- [ ] **Verify**: Sparkles have different timing (staggered effect)

**Status**: ☐ Pass ☐ Fail

---

### Step 4: Pixel Art Quality (30 seconds)
- [ ] Look closely at the cauldron image
- [ ] **Verify**: Pixels are sharp and clearly defined (no blur)
- [ ] **Verify**: No anti-aliasing or smoothing
- [ ] **Verify**: Text uses pixel font (Pixelify Sans)
- [ ] **Verify**: Text has shadow for visibility

**Status**: ☐ Pass ☐ Fail

---

### Step 5: Success Flow (1 minute)
- [ ] Wait for generation to complete
- [ ] **Verify**: Loading screen disappears
- [ ] **Verify**: Success screen appears
- [ ] **Verify**: Download button is available
- [ ] **Verify**: No errors in console

**Status**: ☐ Pass ☐ Fail

---

### Step 6: Error Handling (1 minute)
- [ ] Go back to wizard (click "Generate Another")
- [ ] Open DevTools → Network tab
- [ ] Enable "Offline" mode
- [ ] Click "Generate" button
- [ ] **Verify**: Loading screen appears
- [ ] **Verify**: Loading screen disappears after error
- [ ] **Verify**: Error message is displayed
- [ ] **Verify**: "Try Again" button is available

**Status**: ☐ Pass ☐ Fail

---

### Step 7: Retry Functionality (30 seconds)
- [ ] Disable "Offline" mode in DevTools
- [ ] Click "Try Again" button
- [ ] **Verify**: Loading screen appears again
- [ ] **Verify**: Generation succeeds
- [ ] **Verify**: Success screen appears

**Status**: ☐ Pass ☐ Fail

---

### Step 8: Responsive Design (1 minute)
- [ ] Resize browser to mobile size (~375px width)
- [ ] Trigger loading screen
- [ ] **Verify**: Loading screen fills viewport
- [ ] **Verify**: Cauldron is visible and properly sized
- [ ] **Verify**: Text is readable
- [ ] **Verify**: No horizontal scrolling

**Status**: ☐ Pass ☐ Fail

---

### Step 9: Accessibility Quick Check (30 seconds)
- [ ] Inspect loading screen element in DevTools
- [ ] **Verify**: Container has `role="status"`
- [ ] **Verify**: Container has `aria-live="polite"`
- [ ] **Verify**: Container has `aria-busy="true"`
- [ ] **Verify**: Cauldron image has descriptive alt text

**Status**: ☐ Pass ☐ Fail

---

### Step 10: Performance Check (30 seconds)
- [ ] Trigger loading screen
- [ ] Let animation run for 30 seconds
- [ ] **Verify**: Animation remains smooth
- [ ] **Verify**: No browser slowdown
- [ ] **Verify**: CPU usage is reasonable (check Task Manager)
- [ ] Complete or cancel generation
- [ ] **Verify**: No memory leaks (check DevTools Memory tab)

**Status**: ☐ Pass ☐ Fail

---

## 📊 Quick Test Results

**Total Steps**: 10
**Passed**: _____ / 10
**Failed**: _____ / 10

**Overall Status**: ☐ Pass ☐ Fail

---

## 🐛 Issues Found

If any step failed, document here:

1. **Step #**: _____
   **Issue**: _____________________________
   **Severity**: ☐ Critical ☐ High ☐ Medium ☐ Low

2. **Step #**: _____
   **Issue**: _____________________________
   **Severity**: ☐ Critical ☐ High ☐ Medium ☐ Low

---

## ✅ Sign-off

**Tester**: ___________
**Date**: ___________
**Time Taken**: _____ minutes

**Ready for full testing**: ☐ Yes ☐ No (fix issues first)

---

## 🔄 Next Steps

### If All Tests Pass:
- Proceed to comprehensive manual testing
- Use `__test-generation-loading-manual-checklist.md`
- Test in multiple browsers
- Test various network conditions

### If Any Tests Fail:
- Document issues above
- Fix critical issues first
- Re-run this quick verification
- Once passing, proceed to full testing

---

## 💡 Tips

- **Clear cache** between tests to ensure fresh image loading
- **Check console** for any errors or warnings
- **Use DevTools** Network tab to monitor API calls
- **Test with real data** (not just default values)
- **Try different project names** to verify dynamic content

---

## 🎯 Critical Checks

These MUST pass for basic functionality:

- ✅ Loading screen appears on Generate click
- ✅ Animation cycles through frames
- ✅ Loading screen hides on success
- ✅ Error handling works
- ✅ No console errors

If any critical check fails, **STOP** and fix before proceeding.

---

**Quick Verification Complete**: ☐ Yes ☐ No
