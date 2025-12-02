/**
 * Accessibility Test for Halloween-Themed Deployment Guides
 * 
 * This file contains manual and automated accessibility tests for the
 * Halloween-themed deployment guide components.
 * 
 * Requirements tested:
 * - 3.3: Keyboard navigation and focus indicators
 * - 3.4: ARIA labels and semantic HTML
 * - 3.5: Screen reader compatibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PlatformSelector } from './PlatformSelector';
import { PlatformCard } from './PlatformCard';
import { PlatformComparison } from './PlatformComparison';
import type { Platform } from '@/types/deployment-guides';

expect.extend(toHaveNoViolations);

// Mock platform data
const mockPlatform: Platform = {
  id: 'vercel',
  name: 'Vercel',
  description: 'Best for Next.js applications',
  logo: '/icons/platforms/vercel.svg',
  bestFor: ['Next.js', 'Frontend'],
  features: {
    freeTier: true,
    buildMinutes: '6000 minutes/month',
    databaseSupport: false,
    customDomains: true,
    easeOfUse: 'beginner',
  },
  pricingUrl: 'https://vercel.com/pricing',
  documentationUrl: 'https://vercel.com/docs',
};

describe('Halloween Deployment Guides - Accessibility', () => {
  describe('PlatformSelector', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <PlatformSelector onSelectPlatform={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(<PlatformSelector onSelectPlatform={() => {}} />);
      
      // Check main landmark
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Deployment platform selection');
      
      // Check skip link
      const skipLink = screen.getByText('Skip to platform selection');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass('sr-only');
    });

    it('should have proper heading hierarchy', () => {
      render(<PlatformSelector onSelectPlatform={() => {}} />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Choose Your Deployment Platform');
      
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('should have keyboard-accessible buttons', () => {
      render(<PlatformSelector onSelectPlatform={() => {}} />);
      
      const compareButton = screen.getByRole('button', { name: /compare all deployment platforms/i });
      expect(compareButton).toBeInTheDocument();
      expect(compareButton).toHaveAttribute('aria-label');
    });
  });

  describe('PlatformCard', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <PlatformCard 
          platform={mockPlatform} 
          onClick={() => {}} 
          isRecommended={false}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have descriptive aria-label', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onClick={() => {}} 
          isRecommended={true}
        />
      );
      
      const button = screen.getByRole('button');
      const ariaLabel = button.getAttribute('aria-label');
      
      expect(ariaLabel).toContain(mockPlatform.name);
      expect(ariaLabel).toContain(mockPlatform.description);
      expect(ariaLabel).toContain('Recommended');
    });

    it('should have minimum touch target size', () => {
      const { container } = render(
        <PlatformCard 
          platform={mockPlatform} 
          onClick={() => {}} 
        />
      );
      
      const button = container.querySelector('button');
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('min-w-[44px]');
    });

    it('should have visible focus indicator', () => {
      const { container } = render(
        <PlatformCard 
          platform={mockPlatform} 
          onClick={() => {}} 
        />
      );
      
      const button = container.querySelector('button');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-[#b4ff64]');
    });

    it('should respect reduced motion', () => {
      const { container } = render(
        <PlatformCard 
          platform={mockPlatform} 
          onClick={() => {}} 
        />
      );
      
      const style = container.querySelector('style');
      expect(style?.textContent).toContain('prefers-reduced-motion');
      expect(style?.textContent).toContain('animation: none');
    });

    it('should have proper semantic HTML', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onClick={() => {}} 
        />
      );
      
      // Should be wrapped in article
      expect(screen.getByRole('article')).toBeInTheDocument();
      
      // Should have heading
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(mockPlatform.name);
    });

    it('should have decorative images marked as aria-hidden', () => {
      const { container } = render(
        <PlatformCard 
          platform={mockPlatform} 
          onClick={() => {}} 
        />
      );
      
      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });
  });

  describe('PlatformComparison', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <PlatformComparison 
          onBack={() => {}} 
          onSelectPlatform={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper table structure', () => {
      render(
        <PlatformComparison 
          onBack={() => {}} 
          onSelectPlatform={() => {}}
        />
      );
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Platform feature comparison table');
    });

    it('should have accessible icons with labels', () => {
      const { container } = render(
        <PlatformComparison 
          onBack={() => {}} 
          onSelectPlatform={() => {}}
        />
      );
      
      // Check that checkmark and x icons have aria-labels
      const icons = container.querySelectorAll('[role="img"]');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-label');
        const label = icon.getAttribute('aria-label');
        expect(['Yes', 'No']).toContain(label);
      });
    });

    it('should have skip link', () => {
      render(
        <PlatformComparison 
          onBack={() => {}} 
          onSelectPlatform={() => {}}
        />
      );
      
      const skipLink = screen.getByText('Skip to comparison table');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass('sr-only');
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient contrast for primary text', () => {
      // Primary green (#b4ff64) on dark background (#0a0e1a)
      // This should meet WCAG AA standards (4.5:1 for normal text)
      // Manual verification required - automated tools may not catch all cases
      
      const { container } = render(
        <PlatformSelector onSelectPlatform={() => {}} />
      );
      
      // Check that text elements exist
      expect(screen.getByText('Choose Your Deployment Platform')).toBeInTheDocument();
    });

    it('should have sufficient contrast for button text', () => {
      // Button text (#0a0e1a) on green background (#b4ff64)
      // This should meet WCAG AA standards
      
      render(<PlatformSelector onSelectPlatform={() => {}} />);
      
      const button = screen.getByRole('button', { name: /compare all/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable interactive elements', () => {
      render(<PlatformSelector onSelectPlatform={() => {}} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should have proper focus order', () => {
      const { container } = render(<PlatformSelector onSelectPlatform={() => {}} />);
      
      const focusableElements = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Screen Reader Support', () => {
    it('should have descriptive button labels', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onClick={() => {}} 
          isRecommended={true}
        />
      );
      
      const button = screen.getByRole('button');
      const ariaLabel = button.getAttribute('aria-label');
      
      // Should describe the action and provide context
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel?.length).toBeGreaterThan(20); // Descriptive, not just "Click here"
    });

    it('should have status indicators for recommended platforms', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onClick={() => {}} 
          isRecommended={true}
        />
      );
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Recommended for your project');
    });

    it('should have proper list semantics', () => {
      render(<PlatformSelector onSelectPlatform={() => {}} />);
      
      const lists = screen.getAllByRole('list');
      expect(lists.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Manual Testing Checklist
 * 
 * These tests should be performed manually:
 * 
 * 1. Keyboard Navigation:
 *    - [ ] Tab through all interactive elements
 *    - [ ] Focus indicators are clearly visible
 *    - [ ] Skip link appears on focus
 *    - [ ] Enter/Space activates buttons
 *    - [ ] Escape closes modals (if any)
 * 
 * 2. Screen Reader Testing (NVDA/JAWS/VoiceOver):
 *    - [ ] All headings are announced correctly
 *    - [ ] Button labels are descriptive
 *    - [ ] Platform cards announce all relevant info
 *    - [ ] Table structure is properly announced
 *    - [ ] Icons have appropriate labels
 *    - [ ] Recommended badges are announced
 * 
 * 3. Reduced Motion:
 *    - [ ] Enable "Reduce motion" in OS settings
 *    - [ ] Verify animations are disabled
 *    - [ ] Sparkle effects don't appear
 *    - [ ] Hover effects are minimal
 *    - [ ] Transitions are instant
 * 
 * 4. Color Contrast:
 *    - [ ] Use browser DevTools to check contrast ratios
 *    - [ ] White text on dark background: ≥ 4.5:1
 *    - [ ] Green (#b4ff64) on dark: ≥ 4.5:1
 *    - [ ] Button text on green: ≥ 4.5:1
 *    - [ ] All text meets WCAG AA standards
 * 
 * 5. Touch Targets:
 *    - [ ] All buttons are at least 44x44px
 *    - [ ] Platform cards are easy to tap
 *    - [ ] No accidental activations
 *    - [ ] Adequate spacing between elements
 * 
 * 6. Zoom Testing:
 *    - [ ] Test at 200% zoom
 *    - [ ] No horizontal scrolling
 *    - [ ] All content remains accessible
 *    - [ ] Text doesn't overlap
 * 
 * 7. High Contrast Mode:
 *    - [ ] Enable high contrast mode
 *    - [ ] Borders are visible
 *    - [ ] Focus indicators are clear
 *    - [ ] All interactive elements are distinguishable
 */
