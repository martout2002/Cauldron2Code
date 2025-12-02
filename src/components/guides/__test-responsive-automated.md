# Automated Responsive Testing Script

This document provides automated testing approaches for verifying responsive behavior of the Halloween-themed deployment guides.

## Browser DevTools Automated Testing

### Using Chrome DevTools Protocol

You can automate responsive testing using Chrome DevTools Protocol. Here's a Node.js script example:

```javascript
// test-responsive.js
const puppeteer = require('puppeteer');

const viewports = {
  mobile: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true },
  mobileLandscape: { width: 667, height: 375, deviceScaleFactor: 2, isMobile: true },
  tablet: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true },
  desktop: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false },
};

async function testResponsive() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  for (const [name, viewport] of Object.entries(viewports)) {
    console.log(`\nTesting ${name} (${viewport.width}x${viewport.height})`);
    
    await page.setViewport(viewport);
    await page.goto('http://localhost:3000/guides', { waitUntil: 'networkidle0' });

    // Test 1: Check for Halloween theme class
    const hasThemeClass = await page.$eval('main', el => 
      el.classList.contains('deployment-guide-halloween')
    );
    console.log(`✓ Halloween theme class: ${hasThemeClass ? 'PASS' : 'FAIL'}`);

    // Test 2: Check grid columns
    const gridCols = await page.$$eval('[class*="grid"]', grids => {
      return grids.map(grid => {
        const classes = grid.className;
        if (classes.includes('lg:grid-cols-3')) return 3;
        if (classes.includes('md:grid-cols-2')) return 2;
        return 1;
      });
    });
    console.log(`✓ Grid columns detected: ${Math.max(...gridCols)}`);

    // Test 3: Check touch target sizes
    const buttons = await page.$$('button');
    let minTouchTargetPassed = true;
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        const classes = await button.evaluate(el => el.className);
        if (!classes.includes('min-h-[44px]')) {
          minTouchTargetPassed = false;
          console.log(`✗ Button too small: ${box.width}x${box.height}`);
        }
      }
    }
    if (minTouchTargetPassed) {
      console.log(`✓ Touch targets: PASS`);
    }

    // Test 4: Check for sparkle effects
    const hasSparkles = await page.$('[style*="sparkles.png"]');
    console.log(`✓ Sparkle effects: ${hasSparkles ? 'PASS' : 'FAIL'}`);

    // Test 5: Check font usage
    const fontUsage = await page.$$eval('[class*="font-"]', elements => {
      return elements.some(el => 
        el.className.includes('font-[family-name:var(--font-pixelify)]')
      );
    });
    console.log(`✓ Pixelify Sans font: ${fontUsage ? 'PASS' : 'FAIL'}`);

    // Test 6: Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`✓ No horizontal scroll: ${!hasHorizontalScroll ? 'PASS' : 'FAIL'}`);

    // Take screenshot
    await page.screenshot({ 
      path: `screenshots/guides-${name}.png`,
      fullPage: true 
    });
  }

  await browser.close();
}

testResponsive().catch(console.error);
```

### Running the Script

```bash
# Install dependencies
npm install puppeteer

# Create screenshots directory
mkdir -p screenshots

# Run the test
node test-responsive.js
```

## Visual Regression Testing

### Using Playwright

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

```javascript
// tests/responsive.spec.js
import { test, expect } from '@playwright/test';

test.describe('Responsive Deployment Guides', () => {
  test('mobile layout displays correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/guides');

    // Check for single column layout
    const grid = page.locator('[class*="grid"]').first();
    await expect(grid).toBeVisible();

    // Check touch targets
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }

    // Visual regression
    await expect(page).toHaveScreenshot('mobile-guides.png');
  });

  test('tablet layout displays correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/guides');

    // Check for 2-column layout
    const grid = page.locator('[class*="md:grid-cols-2"]').first();
    await expect(grid).toBeVisible();

    // Visual regression
    await expect(page).toHaveScreenshot('tablet-guides.png');
  });

  test('desktop layout displays correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/guides');

    // Check for 3-column layout
    const grid = page.locator('[class*="lg:grid-cols-3"]').first();
    await expect(grid).toBeVisible();

    // Check comparison table
    await page.click('text=Compare All Platforms');
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Visual regression
    await expect(page).toHaveScreenshot('desktop-guides.png');
  });

  test('sparkle effects work on hover', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/guides');

    // Hover over a platform card
    const card = page.locator('button').first();
    await card.hover();

    // Check for sparkle overlay
    const sparkle = page.locator('[style*="sparkles.png"]');
    await expect(sparkle).toBeVisible();

    // Check animation
    const opacity = await sparkle.evaluate(el => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBeGreaterThan(0);
  });

  test('reduced motion is respected', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/guides');

    // Check that animations are disabled
    const style = await page.locator('style').textContent();
    expect(style).toContain('@media (prefers-reduced-motion: reduce)');
    expect(style).toContain('animation: none');
  });
});
```

### Running Playwright Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run tests
npx playwright test

# Run tests with UI
npx playwright test --ui

# Generate report
npx playwright show-report
```

## Performance Testing

### Using Lighthouse CI

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/guides',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse CI
lhci autorun
```

## Accessibility Testing

### Using axe-core

```javascript
// tests/accessibility.spec.js
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test('guides page is accessible', async ({ page }) => {
    await page.goto('/guides');
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('comparison page is accessible', async ({ page }) => {
    await page.goto('/guides');
    await page.click('text=Compare All Platforms');
    await injectAxe(page);
    await checkA11y(page);
  });
});
```

## Quick Test Script

Create a simple bash script to run all tests:

```bash
#!/bin/bash
# test-responsive.sh

echo "Starting responsive tests..."

# Start dev server
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Run Playwright tests
echo "Running Playwright tests..."
npx playwright test

# Run Lighthouse
echo "Running Lighthouse..."
lhci autorun

# Run accessibility tests
echo "Running accessibility tests..."
npx playwright test tests/accessibility.spec.js

# Kill dev server
kill $DEV_PID

echo "All tests complete!"
```

```bash
chmod +x test-responsive.sh
./test-responsive.sh
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/responsive-tests.yml
name: Responsive Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build app
        run: npm run build
      
      - name: Start server
        run: npm start &
      
      - name: Run Playwright tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

## Manual Testing Checklist

Even with automated tests, manual verification is important:

### Quick Manual Checks

1. **Open DevTools** (F12)
2. **Enable Device Toolbar** (Cmd+Shift+M)
3. **Test each viewport:**
   - Mobile: 375x667
   - Tablet: 768x1024
   - Desktop: 1920x1080

4. **Verify:**
   - [ ] Layout adapts correctly
   - [ ] Touch targets are adequate
   - [ ] Sparkle effects are smooth
   - [ ] No horizontal scrolling
   - [ ] Text is readable
   - [ ] Theme is consistent

5. **Test interactions:**
   - [ ] Click platform cards
   - [ ] Open comparison view
   - [ ] Hover effects work
   - [ ] Keyboard navigation works

6. **Check performance:**
   - [ ] Open Performance tab
   - [ ] Record interaction
   - [ ] Verify 60fps
   - [ ] Check for jank

## Results Documentation

Document your test results:

```markdown
## Automated Test Results

**Date:** [Date]
**Environment:** [Local/CI]
**Branch:** [Branch name]

### Playwright Tests
- Mobile Chrome: ✅ PASS
- Mobile Safari: ✅ PASS
- Tablet: ✅ PASS
- Desktop: ✅ PASS

### Lighthouse Scores
- Performance: 95/100
- Accessibility: 98/100
- Best Practices: 100/100
- SEO: 100/100

### Visual Regression
- No unexpected changes detected

### Accessibility
- No violations found
- WCAG AA compliant

### Issues Found
- None

### Recommendations
- All tests passing
- Ready for deployment
```

## Conclusion

This automated testing approach provides:

1. ✅ Comprehensive coverage of all viewports
2. ✅ Automated visual regression testing
3. ✅ Performance benchmarking
4. ✅ Accessibility validation
5. ✅ CI/CD integration
6. ✅ Repeatable test execution

Combined with manual testing, this ensures the Halloween-themed deployment guides work correctly across all devices and screen sizes.
