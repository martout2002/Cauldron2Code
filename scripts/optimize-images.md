# Image Optimization Guide

## Current Asset Sizes
- background_image.png: 1.5MB (needs optimization to < 200KB)
- cauldron.png: 142KB (✓ already under target)
- broom_stick.png: 13KB (✓ already under target)
- ladle.png: 12KB (✓ already under target)
- search_bar.png: 41KB (✓ already under target)

## Optimization Strategy

### For background_image.png (1.5MB → < 200KB)

The background image is the largest asset and needs significant optimization. Options:

1. **Use Next.js Image Optimization** (Recommended)
   - Next.js automatically optimizes images at runtime
   - Serves WebP format to supported browsers
   - Implements lazy loading and responsive sizing
   - No manual compression needed

2. **Manual Optimization** (if needed)
   - Use online tools like TinyPNG, Squoosh, or ImageOptim
   - Reduce dimensions to max 1920px width
   - Convert to WebP format for better compression
   - Use quality setting of 75-85%

3. **Progressive Loading**
   - Load a low-quality placeholder first
   - Load full quality image in background
   - Implemented via Next.js Image component

## Implementation

The wizard now uses Next.js Image component with:
- Automatic format optimization (WebP)
- Lazy loading for off-screen images
- Responsive sizing based on viewport
- Priority loading for critical images
- Blur placeholder for better UX

## Asset Preloading

Images for the next step are preloaded in the background to ensure smooth transitions.
