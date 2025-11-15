/**
 * Rate Limiter for GitHub Repository Creation
 * Limits users to 5 repositories per hour
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, this should use Redis or a database
const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_REPOS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export class GitHubRateLimiter {
  /**
   * Check if user has exceeded rate limit
   * @param userId - Unique identifier for the user (GitHub login)
   * @returns Object with allowed status and remaining count
   */
  static checkRateLimit(userId: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const entry = rateLimitStore.get(userId);

    // No entry or expired - allow and create new entry
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + RATE_LIMIT_WINDOW_MS;
      rateLimitStore.set(userId, {
        count: 0,
        resetTime,
      });

      return {
        allowed: true,
        remaining: MAX_REPOS_PER_HOUR,
        resetTime,
      };
    }

    // Check if limit exceeded
    if (entry.count >= MAX_REPOS_PER_HOUR) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000); // seconds

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Within limit
    return {
      allowed: true,
      remaining: MAX_REPOS_PER_HOUR - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Increment the rate limit counter for a user
   * @param userId - Unique identifier for the user
   */
  static incrementCount(userId: string): void {
    const entry = rateLimitStore.get(userId);

    if (entry) {
      entry.count += 1;
      rateLimitStore.set(userId, entry);
    }
  }

  /**
   * Get formatted time remaining until reset
   * @param resetTime - Unix timestamp of reset time
   * @returns Human-readable time string
   */
  static getTimeUntilReset(resetTime: number): string {
    const now = Date.now();
    const diff = resetTime - now;

    if (diff <= 0) {
      return 'now';
    }

    const minutes = Math.floor(diff / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);

    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  /**
   * Clear rate limit for a user (for testing or admin purposes)
   * @param userId - Unique identifier for the user
   */
  static clearRateLimit(userId: string): void {
    rateLimitStore.delete(userId);
  }

  /**
   * Clean up expired entries (should be called periodically)
   */
  static cleanup(): void {
    const now = Date.now();
    
    for (const [userId, entry] of rateLimitStore.entries()) {
      if (now >= entry.resetTime) {
        rateLimitStore.delete(userId);
      }
    }
  }
}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    GitHubRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}
