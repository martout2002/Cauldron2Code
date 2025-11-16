/**
 * Redis Client for Rate Limiting and Caching
 * Provides a simple interface for Redis operations
 * Falls back to in-memory storage if Redis is not available
 */

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, expirySeconds?: number): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
  del(key: string): Promise<void>;
}

/**
 * In-memory fallback for development/testing
 */
class InMemoryRedis implements RedisClient {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async set(
    key: string,
    value: string,
    expirySeconds?: number
  ): Promise<void> {
    const expiresAt = expirySeconds
      ? Date.now() + expirySeconds * 1000
      : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (parseInt(current || '0') + 1).toString();
    await this.set(key, newValue);
    return parseInt(newValue);
  }

  async expire(key: string, seconds: number): Promise<void> {
    const item = this.store.get(key);
    if (item) {
      item.expiresAt = Date.now() + seconds * 1000;
    }
  }

  async ttl(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item || !item.expiresAt) return -1;

    const remaining = Math.floor((item.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  // Cleanup expired items periodically
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.store.entries()) {
        if (item.expiresAt && item.expiresAt < now) {
          this.store.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }
}

/**
 * Redis client factory
 * Returns a real Redis client if REDIS_URL is configured,
 * otherwise returns an in-memory fallback
 */
export function createRedisClient(): RedisClient {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn(
      'REDIS_URL not configured. Using in-memory storage for rate limiting. ' +
        'This is not suitable for production with multiple instances.'
    );
    const client = new InMemoryRedis();
    client.startCleanup();
    return client;
  }

  // In a real implementation, you would use a Redis client library like ioredis
  // For now, we'll use the in-memory fallback
  // TODO: Implement actual Redis client when ioredis is added as a dependency
  console.warn(
    'Redis client not yet implemented. Using in-memory fallback. ' +
      'Add ioredis dependency and implement RedisClientImpl for production use.'
  );
  const client = new InMemoryRedis();
  client.startCleanup();
  return client;
}

// Singleton instance
let redisClient: RedisClient | null = null;

export function getRedisClient(): RedisClient {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}
