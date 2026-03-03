import { logger } from '@/core/utils/logger';

import { createClient } from 'redis';

/**
 * Cache metrics for monitoring cache performance
 */
export type CacheMetrics = {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  errors: number;
};

const metrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  invalidations: 0,
  errors: 0,
};

// Redis client singleton
let redisClientPromise: Promise<ReturnType<typeof createClient>> | null = null;

/**
 * Get or create Redis client singleton
 * @throws Error if REDIS_URL is not configured
 */
function getRedisClient(): Promise<ReturnType<typeof createClient>> {
  const { REDIS_URL } = process.env;
  if (!REDIS_URL) {
    throw new Error(
      'Redis cache requires REDIS_URL environment variable. Cache operations are disabled without Redis.',
    );
  }

  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      try {
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        logger.info('Redis cache client connected', { context: 'cache' });
        return client;
      } catch (error) {
        logger.error('Failed to connect Redis cache client', {
          context: 'cache',
          error,
        });
        redisClientPromise = null; // Reset to allow retry
        throw error;
      }
    })();
  }

  return redisClientPromise;
}

/**
 * Generate Redis cache key with prefix
 */
function getCacheKey(key: string): string {
  if (!key || typeof key !== 'string') {
    throw new Error('Cache key must be a non-empty string');
  }
  return `cache:${key}`;
}

/**
 * Get a cached value by key
 *
 * @param key - Cache key (must be non-empty string)
 * @returns Cached value or null if not found/expired
 * @throws Error if Redis is not configured, unavailable, or key is invalid
 *
 * @example
 * ```ts
 * const value = await getCached<User>('user:123');
 * if (value) {
 *   console.log('Found user:', value);
 * }
 * ```
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const cacheKey = getCacheKey(key);
    const value = await client.get(cacheKey);

    if (!value) {
      metrics.misses++;
      return null;
    }

    // Parse stored value (includes expiresAt for double-checking)
    const parsed = JSON.parse(value) as { value: T; expiresAt: number };
    
    // Redis TTL handles expiration, but we double-check for safety
    if (Date.now() > parsed.expiresAt) {
      await client.del(cacheKey);
      metrics.misses++;
      return null;
    }

    metrics.hits++;
    return parsed.value;
  } catch (error) {
    metrics.errors++;
    logger.error('Redis cache get error', { context: 'cache', error, metadata: { key } });
    throw error;
  }
}

/**
 * Set a cached value with TTL
 *
 * @param key - Cache key (must be non-empty string)
 * @param value - Value to cache (will be JSON serialized)
 * @param ttlMs - Time to live in milliseconds (must be positive)
 * @throws Error if Redis is not configured, unavailable, or parameters are invalid
 *
 * @example
 * ```ts
 * await setCached('user:123', userData, 3600000); // Cache for 1 hour
 * ```
 */
export async function setCached<T>(key: string, value: T, ttlMs: number): Promise<void> {
  if (ttlMs <= 0) {
    throw new Error('TTL must be a positive number');
  }

  try {
    const client = await getRedisClient();
    const cacheKey = getCacheKey(key);
    const data = JSON.stringify({
      value,
      expiresAt: Date.now() + ttlMs,
    });
    
    // Redis handles TTL automatically with setEx
    await client.setEx(cacheKey, Math.ceil(ttlMs / 1000), data);
    metrics.sets++;
  } catch (error) {
    metrics.errors++;
    logger.error('Redis cache set error', { context: 'cache', error, metadata: { key } });
    throw error;
  }
}

/**
 * Invalidate a specific cache key
 *
 * @param key - Cache key to invalidate (must be non-empty string)
 * @throws Error if Redis is not configured, unavailable, or key is invalid
 *
 * @example
 * ```ts
 * await invalidateCache('user:123');
 * ```
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    const cacheKey = getCacheKey(key);
    await client.del(cacheKey);
    metrics.invalidations++;
  } catch (error) {
    metrics.errors++;
    logger.error('Redis cache invalidation error', { context: 'cache', error, metadata: { key } });
    throw error;
  }
}

/**
 * Clear all cached values
 *
 * **Warning:** This operation can be slow on large Redis instances as it uses `KEYS` command.
 * For production use, consider invalidating specific keys instead.
 *
 * @throws Error if Redis is not configured or unavailable
 *
 * @example
 * ```ts
 * await clearCache(); // Clears all cache:* keys
 * ```
 */
export async function clearCache(): Promise<void> {
  try {
    const client = await getRedisClient();
    // Note: KEYS can be slow on large instances, but acceptable for cache clearing
    // In production, prefer invalidating specific keys
    const keys = await client.keys(getCacheKey('*'));
    if (keys.length > 0) {
      await client.del(keys);
    }
    metrics.invalidations += keys.length;
  } catch (error) {
    metrics.errors++;
    logger.error('Redis cache clear error', { context: 'cache', error });
    throw error;
  }
}

/**
 * Get current cache metrics
 *
 * @returns Readonly copy of cache metrics
 *
 * @example
 * ```ts
 * const metrics = getCacheMetrics();
 * const hitRate = metrics.hits / (metrics.hits + metrics.misses);
 * console.log(`Cache hit rate: ${(hitRate * 100).toFixed(2)}%`);
 * ```
 */
export function getCacheMetrics(): Readonly<CacheMetrics> {
  return { ...metrics };
}

/**
 * Reset all cache metrics to zero
 *
 * Useful for testing or resetting metrics periodically
 */
export function resetCacheMetrics(): void {
  metrics.hits = 0;
  metrics.misses = 0;
  metrics.sets = 0;
  metrics.invalidations = 0;
  metrics.errors = 0;
}
