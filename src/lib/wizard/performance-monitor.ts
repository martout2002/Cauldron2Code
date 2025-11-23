/**
 * Performance monitoring utilities for wizard animations
 * Helps verify animations run at 60fps without jank
 */

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
}

/**
 * Monitor animation performance
 * Returns metrics about frame rate and dropped frames
 */
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private droppedFrames = 0;
  private isMonitoring = false;
  private rafId: number | null = null;

  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
    this.droppedFrames = 0;
    
    this.measure();
  }

  stop(): PerformanceMetrics {
    this.isMonitoring = false;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    return this.getMetrics();
  }

  private measure = () => {
    if (!this.isMonitoring) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameCount++;
    
    // Calculate FPS every second
    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      
      // Detect dropped frames (below 55fps is considered dropped)
      if (this.fps < 55) {
        this.droppedFrames++;
      }
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    this.rafId = requestAnimationFrame(this.measure);
  };

  getMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      frameTime: this.fps > 0 ? 1000 / this.fps : 0,
      droppedFrames: this.droppedFrames,
    };
  }
}

/**
 * Measure the performance of a specific animation
 */
export async function measureAnimationPerformance(
  animationFn: () => Promise<void>,
  durationMs: number
): Promise<PerformanceMetrics> {
  const monitor = new AnimationPerformanceMonitor();
  
  monitor.start();
  
  // Run the animation
  await animationFn();
  
  // Wait for the specified duration
  await new Promise(resolve => setTimeout(resolve, durationMs));
  
  return monitor.stop();
}

/**
 * Check if the browser supports hardware acceleration
 */
export function supportsHardwareAcceleration(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  return !!gl;
}

/**
 * Log performance metrics to console (development only)
 */
export function logPerformanceMetrics(metrics: PerformanceMetrics, label: string) {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group(`🎨 Performance: ${label}`);
  console.log(`FPS: ${metrics.fps}`);
  console.log(`Frame Time: ${metrics.frameTime.toFixed(2)}ms`);
  console.log(`Dropped Frames: ${metrics.droppedFrames}`);
  
  if (metrics.fps >= 60) {
    console.log('✅ Excellent performance');
  } else if (metrics.fps >= 50) {
    console.log('⚠️ Good performance, minor drops');
  } else {
    console.log('❌ Poor performance, optimization needed');
  }
  
  console.groupEnd();
}

/**
 * Optimize CSS for better animation performance
 * Returns recommended CSS properties for smooth animations
 */
export function getOptimizedAnimationStyles() {
  return {
    // Use transform and opacity for animations (GPU accelerated)
    willChange: 'transform, opacity',
    // Enable hardware acceleration
    transform: 'translateZ(0)',
    // Reduce paint complexity
    backfaceVisibility: 'hidden' as const,
    // Improve rendering
    perspective: 1000,
  };
}
