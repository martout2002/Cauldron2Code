/**
 * Deployment Rate Limiter
 * Prevents abuse by limiting deployments per user per time window
 */

import { getRedisClient } from './redis-client';

export class DeploymentRateLimiter {
  private maxDeployments: number;
  private windowMs: number;

  constructor(
    maxDeployments: number = 10,
    windowMs: number = 60 * 60 * 1000 // 1 hour
  ) {
    this.maxDeployments = maxDeployments;
    this.windowMs = windowMs;
  }

  /**
   * Check if user has exceeded rate limit
   * @param userId - User identifier
   * @returns true if user is within limits, false if exceeded
   */
  async checkLimit(userId: string): Promise<boolean> {
    const redis = getRedisClient();
    const key = `deploy:ratelimit:${userId}`;
    const count = await redis.incr(key);

    if (count === 1) {
      // First request in window, set expiry
      await redis.expire(key, Math.floor(this.windowMs / 1000));
    }

    return count <= this.maxDeployments;
  }

  /**
   * Get remaining deployments for user
   * @param userId - User identifier
   * @returns Number of remaining deployments in current window
   */
  async getRemainingDeployments(userId: string): Promise<number> {
    const redis = getRedisClient();
    const key = `deploy:ratelimit:${userId}`;
    const count = await redis.get(key);
    return Math.max(0, this.maxDeployments - parseInt(count || '0'));
  }

  /**
   * Get time when rate limit resets
   * @param userId - User identifier
   * @returns Date when the rate limit window resets
   */
  async getResetTime(userId: string): Promise<Date> {
    const redis = getRedisClient();
    const key = `deploy:ratelimit:${userId}`;
    const ttl = await redis.ttl(key);

    if (ttl < 0) {
      // No expiry set or key doesn't exist
      return new Date();
    }

    return new Date(Date.now() + ttl * 1000);
  }

  /**
   * Reset rate limit for a user (admin function)
   * @param userId - User identifier
   */
  async resetLimit(userId: string): Promise<void> {
    const redis = getRedisClient();
    const key = `deploy:ratelimit:${userId}`;
    await redis.del(key);
  }

  /**
   * Get rate limit info for a user
   * @param userId - User identifier
   * @returns Rate limit information
   */
  async getRateLimitInfo(userId: string): Promise<{
    limit: number;
    remaining: number;
    reset: Date;
    exceeded: boolean;
  }> {
    const remaining = await this.getRemainingDeployments(userId);
    const reset = await this.getResetTime(userId);
    const exceeded = remaining === 0;

    return {
      limit: this.maxDeployments,
      remaining,
      reset,
      exceeded,
    };
  }
}

// Singleton instance with default configuration
let rateLimiter: DeploymentRateLimiter | null = null;

export function getDeploymentRateLimiter(): DeploymentRateLimiter {
  if (!rateLimiter) {
    const maxDeployments = parseInt(
      process.env.MAX_DEPLOYMENTS_PER_HOUR || '10'
    );
    const windowMs = 60 * 60 * 1000; // 1 hour

    rateLimiter = new DeploymentRateLimiter(maxDeployments, windowMs);
  }
  return rateLimiter;
}
