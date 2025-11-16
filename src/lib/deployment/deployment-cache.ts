/**
 * Deployment Cache
 * Provides caching for platform connection status, project name availability,
 * and deployment status to improve performance and reduce API calls
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class DeploymentCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Set a value in the cache with TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlMs - Time to live in milliseconds
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Check if a key exists and is not expired
   * @param key - Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from the cache
   * @param key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries from the cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns Object with cache stats
   */
  getStats(): { size: number; expired: number } {
    const now = Date.now();
    let expired = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      expired,
    };
  }
}

// Singleton instance
let cacheInstance: DeploymentCache | null = null;

/**
 * Get the singleton DeploymentCache instance
 */
export function getDeploymentCache(): DeploymentCache {
  if (!cacheInstance) {
    cacheInstance = new DeploymentCache();
    
    // Run cleanup every 5 minutes
    setInterval(() => {
      cacheInstance?.cleanup();
    }, 5 * 60 * 1000);
  }
  return cacheInstance;
}

// Cache key generators
export const CacheKeys = {
  platformConnection: (userId: string, platform: string) =>
    `platform:connection:${userId}:${platform}`,
  
  projectNameAvailability: (platform: string, projectName: string) =>
    `platform:project:${platform}:${projectName}`,
  
  deploymentStatus: (deploymentId: string) =>
    `deployment:status:${deploymentId}`,
};

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  PLATFORM_CONNECTION: 5 * 60 * 1000, // 5 minutes
  PROJECT_NAME_AVAILABILITY: 30 * 1000, // 30 seconds
  DEPLOYMENT_STATUS: 5 * 1000, // 5 seconds (between polls)
};
