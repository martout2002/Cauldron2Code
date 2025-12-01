'use client';

import { useEffect, useState } from 'react';

/**
 * GenerationLoadingScreen Component
 * 
 * Displays an animated loading screen during boilerplate generation.
 * Features a spinning cauldron animation using pixel art assets and
 * maintains the wizard's dark pixel art theme.
 * 
 * Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1
 */

// Animation frames for the cauldron spinning animation
// Requirements: 2.1
const ANIMATION_FRAMES = [
  { src: '/loading_1.png', alt: 'Cauldron brewing - frame 1' },
  { src: '/loading_2.png', alt: 'Cauldron brewing - frame 2' },
  { src: '/loading_3.png', alt: 'Cauldron brewing - frame 3' },
];

// Frame rate: 300ms per frame
// Requirements: 2.2
const FRAME_DURATION_MS = 300;

interface GenerationLoadingScreenProps {
  projectName?: string; // Optional project name to display
  mode?: 'github' | 'zip'; // Mode to determine the message displayed
}

export function GenerationLoadingScreen({ 
  projectName,
  mode = 'zip' // Default to 'zip' for backward compatibility
}: GenerationLoadingScreenProps) {
  // State to track current animation frame
  const [currentFrame, setCurrentFrame] = useState(0);
  // State to track if screen reader announcement has been made
  const [announced, setAnnounced] = useState(false);

  // Determine the message based on mode
  // Requirements: 2.1, 2.2
  const message = mode === 'github' ? 'Pushing to GitHub...' : 'Generating...';

  // Announce generation start for screen readers
  // Requirements: 1.5
  useEffect(() => {
    // Set announced to true after a brief delay to ensure the announcement is made
    const timer = setTimeout(() => {
      setAnnounced(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Preload all animation frame images on mount
  // Requirements: 4.5
  useEffect(() => {
    const imageObjects: HTMLImageElement[] = [];

    // Create Image objects for each frame and preload them
    ANIMATION_FRAMES.forEach((frame) => {
      const img = new Image();
      
      // Handle preload errors gracefully with fallback
      img.onerror = () => {
        console.warn(`Failed to preload image: ${frame.src}`);
      };
      
      // Start loading the image
      img.src = frame.src;
      imageObjects.push(img);
    });

    // Cleanup function (images will be garbage collected)
    return () => {
      imageObjects.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  // Implement frame cycling using useEffect and setInterval
  // Requirements: 2.1, 2.2, 2.3
  useEffect(() => {
    // Set up interval to cycle through frames
    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => {
        // Loop back to 0 after the last frame (ensures continuous looping)
        return (prevFrame + 1) % ANIMATION_FRAMES.length;
      });
    }, FRAME_DURATION_MS);

    // Cleanup interval on unmount to prevent memory leaks
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Screen reader announcement for generation start */}
      {/* Requirements: 1.5 */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {announced && `${message} ${projectName ? projectName : 'your project'}. Please wait...`}
      </div>
      
      {/* Centered container for animation and text */}
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Cauldron animation with sparkle effects */}
        {/* Requirements: 3.4 */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Sparkle effects positioned around the cauldron */}
          {/* Top-left sparkle */}
          <div 
            className="absolute top-0 left-0 w-20 h-20 opacity-80"
            style={{
              backgroundImage: 'url(/sparkles.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              animation: 'sparkle-pulse 1.5s ease-in-out infinite',
              animationDelay: '0s',
            }}
            aria-hidden="true"
          />
          
          {/* Top-right sparkle */}
          <div 
            className="absolute top-0 right-0 w-20 h-20 opacity-80"
            style={{
              backgroundImage: 'url(/sparkles.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              animation: 'sparkle-pulse 1.5s ease-in-out infinite',
              animationDelay: '0.5s',
            }}
            aria-hidden="true"
          />
          
          {/* Bottom-left sparkle */}
          <div 
            className="absolute bottom-0 left-0 w-20 h-20 opacity-80"
            style={{
              backgroundImage: 'url(/sparkles.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              animation: 'sparkle-pulse 1.5s ease-in-out infinite',
              animationDelay: '1s',
            }}
            aria-hidden="true"
          />
          
          {/* Bottom-right sparkle */}
          <div 
            className="absolute bottom-0 right-0 w-20 h-20 opacity-80"
            style={{
              backgroundImage: 'url(/sparkles.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              animation: 'sparkle-pulse 1.5s ease-in-out infinite',
              animationDelay: '0.25s',
            }}
            aria-hidden="true"
          />
          
          {/* Cauldron animation */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ANIMATION_FRAMES[currentFrame]?.src ?? '/loading_1.png'}
            alt={ANIMATION_FRAMES[currentFrame]?.alt ?? 'Cauldron brewing'}
            className="w-full h-full object-contain relative z-10"
            style={{
              imageRendering: 'pixelated',
              // Fallback for different browsers
              // @ts-expect-error - vendor prefixes
              WebkitImageRendering: 'pixelated',
              MozImageRendering: 'crisp-edges',
            }}
          />
        </div>

        {/* Message text with pixel font styling */}
        {/* Requirements: 1.3, 3.2, 2.1, 2.2 */}
        <div className="text-center">
          <p 
            className="font-(family-name:--font-pixelify) text-[clamp(1.5rem,4vw,2.5rem)] font-semibold text-white"
            style={{ 
              textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8)',
              letterSpacing: '0.05em'
            }}
          >
            {message}
          </p>
        </div>
      </div>
      
      {/* Sparkle animation styles */}
      <style jsx>{`
        @keyframes sparkle-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
