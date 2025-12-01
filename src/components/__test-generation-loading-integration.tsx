/**
 * Integration Tests for Generation Loading Screen
 * 
 * Task 20: Test integration and polish
 * - Test complete flow from wizard to loading screen to success
 * - Verify pixel art quality on different screen sizes
 * - Test on different browsers for compatibility
 * - Verify animation smoothness
 * - Test with slow network conditions
 * 
 * Requirements: All
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { GenerationLoadingScreen } from './GenerationLoadingScreen';

describe('GenerationLoadingScreen - Integration Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Complete Flow Tests', () => {
    test('should render loading screen with all required elements', () => {
      render(<GenerationLoadingScreen projectName="test-project" />);

      // Verify loading screen container
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('aria-live', 'polite');
      expect(container).toHaveAttribute('aria-busy', 'true');

      // Verify "Generating..." text is present
      expect(screen.getByText('Generating...')).toBeInTheDocument();

      // Verify cauldron image is present
      const cauldronImage = screen.getByAltText(/Cauldron brewing - frame/);
      expect(cauldronImage).toBeInTheDocument();
    });

    test('should announce generation start for screen readers', async () => {
      render(<GenerationLoadingScreen projectName="my-awesome-app" />);

      // Fast-forward past the announcement delay
      act(() => {
        jest.advanceTimersByTime(150);
      });

      // Verify screen reader announcement
      await waitFor(() => {
        const announcement = screen.getByText(/Generating my-awesome-app\. Please wait\.\.\./);
        expect(announcement).toBeInTheDocument();
      });
    });

    test('should handle missing project name gracefully', async () => {
      render(<GenerationLoadingScreen />);

      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        const announcement = screen.getByText(/Generating your project\. Please wait\.\.\./);
        expect(announcement).toBeInTheDocument();
      });
    });
  });

  describe('Animation Tests', () => {
    test('should cycle through all three animation frames', () => {
      render(<GenerationLoadingScreen />);

      // Initial frame should be loading_1.png
      let cauldronImage = screen.getByAltText(/Cauldron brewing - frame/);
      expect(cauldronImage).toHaveAttribute('src', '/loading_1.png');

      // Advance to frame 2 (300ms)
      act(() => {
        jest.advanceTimersByTime(300);
      });
      cauldronImage = screen.getByAltText(/Cauldron brewing - frame/);
      expect(cauldronImage).toHaveAttribute('src', '/loading_2.png');

      // Advance to frame 3 (600ms total)
      act(() => {
        jest.advanceTimersByTime(300);
      });
      cauldronImage = screen.getByAltText(/Cauldron brewing - frame/);
      expect(cauldronImage).toHaveAttribute('src', '/loading_3.png');

      // Advance to loop back to frame 1 (900ms total)
      act(() => {
        jest.advanceTimersByTime(300);
      });
      cauldronImage = screen.getByAltText(/Cauldron brewing - frame/);
      expect(cauldronImage).toHaveAttribute('src', '/loading_1.png');
    });

    test('should maintain consistent frame rate', () => {
      render(<GenerationLoadingScreen />);

      const frameDuration = 300; // ms
      const frames = ['/loading_1.png', '/loading_2.png', '/loading_3.png'];

      frames.forEach((expectedSrc, _index) => {
        const cauldronImage = screen.getByAltText(/Cauldron brewing - frame/);
        expect(cauldronImage).toHaveAttribute('src', expectedSrc);
        
        act(() => {
          jest.advanceTimersByTime(frameDuration);
        });
      });
    });

    test('should loop animation continuously', () => {
      render(<GenerationLoadingScreen />);

      // Run through 3 complete cycles (9 frames)
      for (let cycle = 0; cycle < 3; cycle++) {
        for (let frame = 0; frame < 3; frame++) {
          const expectedFrame = `/loading_${frame + 1}.png`;
          const cauldronImage = screen.getByAltText(/Cauldron brewing - frame/);
          expect(cauldronImage).toHaveAttribute('src', expectedFrame);
          
          act(() => {
            jest.advanceTimersByTime(300);
          });
        }
      }
    });

    test('should cleanup animation interval on unmount', () => {
      const { unmount } = render(<GenerationLoadingScreen />);

      // Verify animation is running
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Unmount component
      unmount();

      // Verify no timers are left running
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('Pixel Art Quality Tests', () => {
    test('should apply pixelated image rendering', () => {
      render(<GenerationLoadingScreen />);

      const cauldronImage = screen.getByAltText(/Cauldron brewing - frame/) as HTMLImageElement;
      
      // Check for pixelated rendering style
      const style = cauldronImage.style;
      expect(style.imageRendering).toBe('pixelated');
    });

    test('should use pixel font for text', () => {
      render(<GenerationLoadingScreen />);

      const generatingText = screen.getByText('Generating...');
      
      // Check for pixel font class
      expect(generatingText).toHaveClass('font-[family-name:var(--font-pixelify)]');
    });

    test('should have dark background matching wizard theme', () => {
      render(<GenerationLoadingScreen />);

      const container = screen.getByRole('status');
      
      // Check for dark background class
      expect(container).toHaveClass('bg-zinc-950');
    });

    test('should center cauldron animation', () => {
      render(<GenerationLoadingScreen />);

      const container = screen.getByRole('status');
      
      // Check for centering classes
      expect(container).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  describe('Sparkle Effects Tests', () => {
    test('should render sparkle effects around cauldron', () => {
      const { container } = render(<GenerationLoadingScreen />);

      // Find all elements with sparkles.png background
      const sparkles = container.querySelectorAll('[style*="sparkles.png"]');
      
      // Should have 4 sparkles (top-left, top-right, bottom-left, bottom-right)
      expect(sparkles.length).toBe(4);
    });

    test('should position sparkles in all four corners', () => {
      const { container } = render(<GenerationLoadingScreen />);

      const sparkles = container.querySelectorAll('[style*="sparkles.png"]');
      
      // Check positioning classes
      const positions = Array.from(sparkles).map(sparkle => {
        const classes = sparkle.className;
        if (classes.includes('top-0') && classes.includes('left-0')) return 'top-left';
        if (classes.includes('top-0') && classes.includes('right-0')) return 'top-right';
        if (classes.includes('bottom-0') && classes.includes('left-0')) return 'bottom-left';
        if (classes.includes('bottom-0') && classes.includes('right-0')) return 'bottom-right';
        return 'unknown';
      });

      expect(positions).toContain('top-left');
      expect(positions).toContain('top-right');
      expect(positions).toContain('bottom-left');
      expect(positions).toContain('bottom-right');
    });

    test('should hide sparkles from screen readers', () => {
      const { container } = render(<GenerationLoadingScreen />);

      const sparkles = container.querySelectorAll('[style*="sparkles.png"]');
      
      sparkles.forEach(sparkle => {
        expect(sparkle).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Accessibility Tests', () => {
    test('should have proper ARIA attributes', () => {
      render(<GenerationLoadingScreen />);

      const container = screen.getByRole('status');
      
      expect(container).toHaveAttribute('role', 'status');
      expect(container).toHaveAttribute('aria-live', 'polite');
      expect(container).toHaveAttribute('aria-busy', 'true');
    });

    test('should provide descriptive alt text for animation frames', () => {
      render(<GenerationLoadingScreen />);

      const cauldronImage = screen.getByAltText(/Cauldron brewing - frame/);
      expect(cauldronImage).toBeInTheDocument();

      // Verify alt text changes with frames
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(screen.getByAltText(/Cauldron brewing - frame 2/)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(screen.getByAltText(/Cauldron brewing - frame 3/)).toBeInTheDocument();
    });

    test('should have screen reader announcement with assertive priority', () => {
      render(<GenerationLoadingScreen projectName="test-app" />);

      act(() => {
        jest.advanceTimersByTime(150);
      });

      const srOnly = screen.getByText(/Generating test-app/);
      const parent = srOnly.parentElement;
      
      expect(parent).toHaveAttribute('aria-live', 'assertive');
      expect(parent).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Image Preloading Tests', () => {
    test('should preload all animation frames on mount', () => {
      // Mock Image constructor
      const mockImages: any[] = [];
      const OriginalImage = global.Image;
      
      (global as any).Image = class {
        src = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        
        constructor() {
          mockImages.push(this);
        }
      };

      render(<GenerationLoadingScreen />);

      // Should create 3 Image objects (one for each frame)
      expect(mockImages.length).toBe(3);
      
      // Verify correct sources
      expect(mockImages[0].src).toContain('loading_1.png');
      expect(mockImages[1].src).toContain('loading_2.png');
      expect(mockImages[2].src).toContain('loading_3.png');

      // Restore original Image
      global.Image = OriginalImage;
    });

    test('should handle preload errors gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Mock Image constructor with error
      const OriginalImage = global.Image;
      (global as any).Image = class {
        src = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        
        constructor() {
          // Simulate error after a delay
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      };

      render(<GenerationLoadingScreen />);

      act(() => {
        jest.runAllTimers();
      });

      // Should log warnings for failed preloads
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to preload image')
      );

      consoleWarnSpy.mockRestore();
      global.Image = OriginalImage;
    });
  });

  describe('Responsive Design Tests', () => {
    test('should use responsive text sizing', () => {
      render(<GenerationLoadingScreen />);

      const generatingText = screen.getByText('Generating...');
      
      // Check for clamp-based responsive sizing
      expect(generatingText).toHaveClass('text-[clamp(1.5rem,4vw,2.5rem)]');
    });

    test('should maintain fixed positioning on all screen sizes', () => {
      render(<GenerationLoadingScreen />);

      const container = screen.getByRole('status');
      
      // Check for fixed positioning that covers entire viewport
      expect(container).toHaveClass('fixed', 'inset-0');
    });

    test('should have proper z-index for overlay', () => {
      render(<GenerationLoadingScreen />);

      const container = screen.getByRole('status');
      
      // Should have high z-index to appear above other content
      expect(container).toHaveClass('z-50');
    });
  });

  describe('Performance Tests', () => {
    test('should not cause memory leaks with long-running animation', () => {
      const { unmount } = render(<GenerationLoadingScreen />);

      // Run animation for extended period (30 seconds simulated)
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      // Unmount and verify cleanup
      unmount();
      expect(jest.getTimerCount()).toBe(0);
    });

    test('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<GenerationLoadingScreen />);
        
        act(() => {
          jest.advanceTimersByTime(100);
        });
        
        unmount();
      }

      // All timers should be cleaned up
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('Text Styling Tests', () => {
    test('should apply text shadow for visibility', () => {
      render(<GenerationLoadingScreen />);

      const generatingText = screen.getByText('Generating...');
      
      // Check for text shadow in style
      expect(generatingText).toHaveStyle({
        textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8)',
      });
    });

    test('should apply letter spacing', () => {
      render(<GenerationLoadingScreen />);

      const generatingText = screen.getByText('Generating...');
      
      expect(generatingText).toHaveStyle({
        letterSpacing: '0.05em',
      });
    });

    test('should use white text color', () => {
      render(<GenerationLoadingScreen />);

      const generatingText = screen.getByText('Generating...');
      
      expect(generatingText).toHaveClass('text-white');
    });
  });
});
