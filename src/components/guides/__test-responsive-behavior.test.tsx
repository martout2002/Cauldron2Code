/**
 * Responsive Behavior Tests for Halloween-themed Deployment Guides
 * 
 * Tests Requirements:
 * - 3.1: Mobile layout (< 640px) with themed components
 * - 3.2: Tablet layout (640px - 1024px) with themed components
 * - 4.5: Desktop layout (> 1024px) with themed components
 * - Touch targets minimum 44x44px on mobile
 * - Landscape orientation on mobile devices
 * - Sparkle effects work smoothly on all devices
 */

import { render, screen, within } from '@testing-library/react';
import { PlatformSelector } from './PlatformSelector';
import { PlatformCard } from './PlatformCard';
import { PlatformComparison } from './PlatformComparison';
import { PLATFORMS } from '@/lib/deployment/platforms';
import type { ScaffoldConfig } from '@/types';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Helper to set viewport size
const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// Helper to check if element meets minimum touch target size
const checkTouchTargetSize = (element: HTMLElement, minSize = 44): boolean => {
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  
  // Get actual dimensions including padding
  const width = rect.width || parseFloat(computedStyle.width);
  const height = rect.height || parseFloat(computedStyle.height);
  
  // Check if element has min-height or min-width set
  const minHeight = parseFloat(computedStyle.minHeight) || height;
  const minWidth = parseFloat(computedStyle.minWidth) || width;
  
  return minHeight >= minSize && minWidth >= minSize;
};

// Mock scaffold config for testing
const mockScaffoldConfig: ScaffoldConfig = {
  projectName: 'test-project',
  framework: 'nextjs',
  styling: 'tailwind',
  features: {
    auth: false,
    database: false,
    api: false,
  },
};

describe('Responsive Behavior Tests', () => {
  describe('Mobile Layout (< 640px)', () => {
    beforeEach(() => {
      setViewport(375, 667); // iPhone SE dimensions
    });

    test('PlatformSelector renders correctly on mobile', () => {
      const mockOnSelect = jest.fn();
      render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Check that main heading is visible
      expect(screen.getByRole('heading', { name: /choose your deployment platform/i })).toBeInTheDocument();
      
      // Check that compare button is visible
      expect(screen.getByRole('button', { name: /compare all platforms/i })).toBeInTheDocument();
      
      // Check that platform cards are rendered
      const platformCards = screen.getAllByRole('listitem');
      expect(platformCards.length).toBeGreaterThan(0);
    });

    test('PlatformCard has minimum 44x44px touch targets on mobile', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PlatformCard
          platform={PLATFORMS[0]}
          onClick={mockOnClick}
          isRecommended={false}
        />
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      
      if (button) {
        // Check that button has min-height and min-width classes
        const classes = button.className;
        expect(classes).toContain('min-h-[44px]');
        expect(classes).toContain('min-w-[44px]');
      }
    });

    test('PlatformComparison shows mobile card layout on small screens', () => {
      const mockOnBack = jest.fn();
      const mockOnSelect = jest.fn();
      
      render(
        <PlatformComparison
          onBack={mockOnBack}
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Mobile view should show cards, not table
      const table = screen.queryByRole('table');
      expect(table).not.toBeVisible(); // Table should be hidden on mobile
      
      // Check that platform cards are visible
      const platformNames = PLATFORMS.map(p => p.name);
      platformNames.forEach(name => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });
    });

    test('All interactive elements have sufficient touch targets on mobile', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Get all buttons
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        const classes = button.className;
        // Check for min-height class or inline styles
        const hasMinHeight = classes.includes('min-h-[44px]') || 
                           classes.includes('py-3') || 
                           classes.includes('py-4');
        expect(hasMinHeight).toBe(true);
      });
    });

    test('Text remains readable on mobile with themed styling', () => {
      const mockOnSelect = jest.fn();
      render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Check that Pixelify Sans font is applied
      const heading = screen.getByRole('heading', { name: /choose your deployment platform/i });
      const classes = heading.className;
      expect(classes).toContain('font-[family-name:var(--font-pixelify)]');
      
      // Check that text color provides contrast
      expect(classes).toContain('text-white');
    });
  });

  describe('Mobile Landscape Orientation', () => {
    beforeEach(() => {
      setViewport(667, 375); // iPhone SE landscape
    });

    test('PlatformSelector adapts to landscape orientation', () => {
      const mockOnSelect = jest.fn();
      render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Content should still be accessible
      expect(screen.getByRole('heading', { name: /choose your deployment platform/i })).toBeInTheDocument();
      
      // Grid should adapt (still single column on narrow landscape)
      const platformCards = screen.getAllByRole('listitem');
      expect(platformCards.length).toBeGreaterThan(0);
    });

    test('PlatformComparison remains usable in landscape', () => {
      const mockOnBack = jest.fn();
      const mockOnSelect = jest.fn();
      
      render(
        <PlatformComparison
          onBack={mockOnBack}
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Back button should be accessible
      expect(screen.getByRole('button', { name: /back to platform selection/i })).toBeInTheDocument();
      
      // Platform information should be visible
      PLATFORMS.forEach(platform => {
        expect(screen.getByText(platform.name)).toBeInTheDocument();
      });
    });
  });

  describe('Tablet Layout (640px - 1024px)', () => {
    beforeEach(() => {
      setViewport(768, 1024); // iPad dimensions
    });

    test('PlatformSelector uses 2-column grid on tablet', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Check for md:grid-cols-2 class
      const grids = container.querySelectorAll('[class*="grid"]');
      const hasTabletGrid = Array.from(grids).some(grid => 
        grid.className.includes('md:grid-cols-2')
      );
      expect(hasTabletGrid).toBe(true);
    });

    test('PlatformComparison shows card layout on tablet', () => {
      const mockOnBack = jest.fn();
      const mockOnSelect = jest.fn();
      
      render(
        <PlatformComparison
          onBack={mockOnBack}
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Table should still be hidden on tablet (< 1024px)
      const table = screen.queryByRole('table');
      expect(table).not.toBeVisible();
      
      // Cards should be visible
      PLATFORMS.forEach(platform => {
        expect(screen.getByText(platform.name)).toBeInTheDocument();
      });
    });

    test('Touch targets remain adequate on tablet', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PlatformCard
          platform={PLATFORMS[0]}
          onClick={mockOnClick}
          isRecommended={false}
        />
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      
      if (button) {
        const classes = button.className;
        expect(classes).toContain('min-h-[44px]');
        expect(classes).toContain('min-w-[44px]');
      }
    });

    test('Themed styling is consistent on tablet', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Check for Halloween theme classes
      const mainElement = container.querySelector('main');
      expect(mainElement?.className).toContain('deployment-guide-halloween');
      
      // Check for pixel art font
      const headings = container.querySelectorAll('h1, h2, h3');
      headings.forEach(heading => {
        expect(heading.className).toContain('font-[family-name:var(--font-pixelify)]');
      });
    });
  });

  describe('Desktop Layout (> 1024px)', () => {
    beforeEach(() => {
      setViewport(1920, 1080); // Full HD desktop
    });

    test('PlatformSelector uses 3-column grid on desktop', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Check for lg:grid-cols-3 class
      const grids = container.querySelectorAll('[class*="grid"]');
      const hasDesktopGrid = Array.from(grids).some(grid => 
        grid.className.includes('lg:grid-cols-3')
      );
      expect(hasDesktopGrid).toBe(true);
    });

    test('PlatformComparison shows table layout on desktop', () => {
      const mockOnBack = jest.fn();
      const mockOnSelect = jest.fn();
      
      const { container } = render(
        <PlatformComparison
          onBack={mockOnBack}
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Table should be visible on desktop
      const tableContainer = container.querySelector('.hidden.lg\\:block');
      expect(tableContainer).toBeInTheDocument();
      
      // Check that table has proper structure
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    test('All Halloween theme elements are visible on desktop', () => {
      const mockOnSelect = jest.fn();
      render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Check for themed decorative elements
      expect(screen.getByRole('heading', { name: /choose your deployment platform/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /compare all platforms/i })).toBeInTheDocument();
      
      // Check for help section
      expect(screen.getByText(/not sure which platform to choose/i)).toBeInTheDocument();
    });

    test('Hover effects are properly configured on desktop', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PlatformCard
          platform={PLATFORMS[0]}
          onClick={mockOnClick}
          isRecommended={false}
        />
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      
      if (button) {
        const classes = button.className;
        // Check for hover transform classes
        expect(classes).toContain('hover:scale-105');
        expect(classes).toContain('hover:-translate-y-1');
        expect(classes).toContain('transition-all');
      }
    });
  });

  describe('Sparkle Effects', () => {
    test('Sparkle overlay is present in PlatformCard', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PlatformCard
          platform={PLATFORMS[0]}
          onClick={mockOnClick}
          isRecommended={false}
        />
      );

      // Check for sparkle overlay div
      const sparkleOverlay = container.querySelector('[style*="sparkles.png"]');
      expect(sparkleOverlay).toBeInTheDocument();
      
      if (sparkleOverlay) {
        const style = (sparkleOverlay as HTMLElement).style;
        expect(style.backgroundImage).toContain('sparkles.png');
        expect(style.animation).toContain('sparkle-pulse');
      }
    });

    test('Sparkle effects respect reduced motion preference', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PlatformCard
          platform={PLATFORMS[0]}
          onClick={mockOnClick}
          isRecommended={false}
        />
      );

      // Check for reduced motion CSS
      const style = container.querySelector('style');
      expect(style?.textContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(style?.textContent).toContain('animation: none');
    });

    test('Sparkle animation is defined', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PlatformCard
          platform={PLATFORMS[0]}
          onClick={mockOnClick}
          isRecommended={false}
        />
      );

      // Check for sparkle-pulse keyframes
      const style = container.querySelector('style');
      expect(style?.textContent).toContain('@keyframes sparkle-pulse');
      expect(style?.textContent).toContain('transform: scale');
      expect(style?.textContent).toContain('opacity');
    });
  });

  describe('Performance and Smooth Rendering', () => {
    test('Components use GPU acceleration for transforms', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PlatformCard
          platform={PLATFORMS[0]}
          onClick={mockOnClick}
          isRecommended={false}
        />
      );

      const button = container.querySelector('button');
      if (button) {
        const style = button.style;
        expect(style.willChange).toBe('transform');
        expect(style.transform).toContain('translateZ(0)');
      }
    });

    test('Transitions are properly configured for smooth animations', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PlatformCard
          platform={PLATFORMS[0]}
          onClick={mockOnClick}
          isRecommended={false}
        />
      );

      const button = container.querySelector('button');
      if (button) {
        const classes = button.className;
        expect(classes).toContain('transition-all');
        expect(classes).toContain('duration-300');
      }
    });

    test('Recommended badge has pulse animation', () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <PlatformCard
          platform={PLATFORMS[0]}
          onClick={mockOnClick}
          isRecommended={true}
        />
      );

      const badge = container.querySelector('[class*="animate-pulse"]');
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toContain('Recommended');
    });
  });

  describe('Accessibility Across Devices', () => {
    test('Focus indicators are visible on all screen sizes', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Check for focus styles in CSS
      const style = container.querySelector('style');
      expect(style?.textContent).toContain('focus-visible');
      expect(style?.textContent).toContain('outline');
    });

    test('Skip links are present for keyboard navigation', () => {
      const mockOnSelect = jest.fn();
      render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      const skipLink = screen.getByText(/skip to platform selection/i);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink.className).toContain('sr-only');
      expect(skipLink.className).toContain('focus:not-sr-only');
    });

    test('ARIA labels are preserved across all layouts', () => {
      const mockOnSelect = jest.fn();
      render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Check for main landmark
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Deployment platform selection');
      
      // Check for section headings
      const recommendedHeading = screen.queryByText(/recommended for your project/i);
      if (recommendedHeading) {
        expect(recommendedHeading.id).toBeTruthy();
      }
    });
  });

  describe('Cross-Device Consistency', () => {
    test('Halloween color palette is consistent across breakpoints', () => {
      const mockOnSelect = jest.fn();
      
      // Test mobile
      setViewport(375, 667);
      const { container: mobileContainer } = render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );
      
      // Test desktop
      setViewport(1920, 1080);
      const { container: desktopContainer } = render(
        <PlatformSelector
          onSelectPlatform={mockOnSelect}
          scaffoldConfig={mockScaffoldConfig}
        />
      );

      // Both should have the same theme class
      expect(mobileContainer.querySelector('.deployment-guide-halloween')).toBeInTheDocument();
      expect(desktopContainer.querySelector('.deployment-guide-halloween')).toBeInTheDocument();
    });

    test('Pixelify Sans font is applied consistently', () => {
      const mockOnClick = jest.fn();
      
      // Test on different viewport sizes
      const viewports = [
        [375, 667],   // Mobile
        [768, 1024],  // Tablet
        [1920, 1080], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        setViewport(width, height);
        const { container } = render(
          <PlatformCard
            platform={PLATFORMS[0]}
            onClick={mockOnClick}
            isRecommended={false}
          />
        );

        const headings = container.querySelectorAll('h3');
        headings.forEach(heading => {
          expect(heading.className).toContain('font-[family-name:var(--font-pixelify)]');
        });
      });
    });
  });
});
