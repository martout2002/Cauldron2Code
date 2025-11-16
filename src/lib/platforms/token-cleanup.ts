/**
 * Token Cleanup Service
 * Handles automatic cleanup of expired and unused tokens
 */

import { getRedisClient } from './redis-client';
import type { PlatformConnection } from './types';

export class TokenCleanupService {
  private cleanupIntervalMs: number;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(cleanupIntervalMs: number = 60 * 60 * 1000) {
    // Default: 1 hour
    this.cleanupIntervalMs = cleanupIntervalMs;
  }

  /**
   * Start automatic token cleanup
   * Runs periodically to clean up expired tokens
   */
  start(): void {
    if (this.intervalId) {
      console.warn('Token cleanup service is already running');
      return;
    }

    console.log('Starting token cleanup service');

    // Run cleanup immediately
    this.cleanup().catch((error) => {
      console.error('Initial token cleanup failed:', error);
    });

    // Schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.cleanup().catch((error) => {
        console.error('Periodic token cleanup failed:', error);
      });
    }, this.cleanupIntervalMs);
  }

  /**
   * Stop automatic token cleanup
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Token cleanup service stopped');
    }
  }

  /**
   * Perform token cleanup
   * Removes expired tokens from storage
   */
  private async cleanup(): Promise<void> {
    const redis = getRedisClient();
    const now = Date.now();

    try {
      // Get all connection keys
      const keys = await this.getAllConnectionKeys();

      let cleanedCount = 0;

      for (const key of keys) {
        try {
          const connectionData = await redis.get(key);

          if (!connectionData) {
            continue;
          }

          const connection: PlatformConnection = JSON.parse(connectionData);

          // Check if token is expired
          if (this.isExpired(connection, now)) {
            await redis.del(key);
            cleanedCount++;
            console.log(
              `Cleaned up expired token for user ${connection.userId} on ${connection.platform}`
            );
          }

          // Check if token hasn't been used in a long time (1 year)
          const lastUsedMs = new Date(connection.lastUsedAt).getTime();
          const oneYearMs = 365 * 24 * 60 * 60 * 1000;

          if (now - lastUsedMs > oneYearMs) {
            await redis.del(key);
            cleanedCount++;
            console.log(
              `Cleaned up unused token for user ${connection.userId} on ${connection.platform}`
            );
          }
        } catch (error) {
          console.error(`Failed to process connection key ${key}:`, error);
        }
      }

      if (cleanedCount > 0) {
        console.log(`Token cleanup completed: ${cleanedCount} tokens removed`);
      }
    } catch (error) {
      console.error('Token cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Check if a connection token is expired
   */
  private isExpired(connection: PlatformConnection, now: number): boolean {
    if (!connection.expiresAt) {
      // No expiry set (e.g., Vercel tokens don't expire)
      return false;
    }

    const expiresAtMs = new Date(connection.expiresAt).getTime();
    return expiresAtMs < now;
  }

  /**
   * Get all connection keys from Redis
   * This is a simplified implementation - in production, you'd want to use
   * a more efficient method like maintaining a set of connection keys
   */
  private async getAllConnectionKeys(): Promise<string[]> {
    // In a real implementation with ioredis, you would use SCAN
    // For now, we'll return an empty array since we're using in-memory fallback
    // This method should be implemented when Redis is properly integrated
    return [];
  }

  /**
   * Manually clean up tokens for a specific user
   */
  async cleanupUserTokens(userId: string): Promise<void> {
    const redis = getRedisClient();

    const platforms: Array<'vercel' | 'railway' | 'render'> = [
      'vercel',
      'railway',
      'render',
    ];

    for (const platform of platforms) {
      const key = `platform:connection:${userId}:${platform}`;
      await redis.del(key);
    }

    console.log(`Cleaned up all tokens for user ${userId}`);
  }

  /**
   * Manually clean up tokens for a specific platform
   */
  async cleanupPlatformTokens(
    userId: string,
    platform: 'vercel' | 'railway' | 'render'
  ): Promise<void> {
    const redis = getRedisClient();
    const key = `platform:connection:${userId}:${platform}`;
    await redis.del(key);

    console.log(`Cleaned up ${platform} token for user ${userId}`);
  }
}

// Singleton instance
let cleanupService: TokenCleanupService | null = null;

export function getTokenCleanupService(): TokenCleanupService {
  if (!cleanupService) {
    const intervalMs = parseInt(
      process.env.TOKEN_CLEANUP_INTERVAL_MS || '3600000' // 1 hour
    );
    cleanupService = new TokenCleanupService(intervalMs);
  }
  return cleanupService;
}

/**
 * Initialize token cleanup service
 * Should be called once when the application starts
 */
export function initializeTokenCleanup(): void {
  const service = getTokenCleanupService();
  service.start();
}
