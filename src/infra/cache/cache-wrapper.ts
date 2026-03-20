import { logger } from '@/core/utils/logger.server';

import { getCached, setCached } from './index';

/**
 * Cache wrapper options
 */
export type CacheOptions = {
  /**
   * Cache key prefix (e.g., 'product', 'collection')
   */
  prefix: string;
  /**
   * Time to live in milliseconds
   */
  ttlMs: number;
  /**
   * Whether to enable caching (useful for feature flags or conditional caching)
   * @default true
   */
  enabled?: boolean;
};

/**
 * Wraps an async function with Redis caching
 *
 * @param fn - The function to cache
 * @param options - Cache configuration
 * @returns Cached version of the function
 *
 * @example
 * ```ts
 * const cachedGetProduct = withCache(
 *   async (handle: string) => storefrontSdk().getProductByHandle({ handle }),
 *   { prefix: 'product', ttlMs: 3600000 }
 * );
 * ```
 */
export function withCache<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: CacheOptions,
): (...args: TArgs) => Promise<TReturn> {
  const { prefix, ttlMs, enabled = true } = options;

  return async (...args: TArgs): Promise<TReturn> => {
    const cacheKey = generateCacheKey(prefix, args);

    if (!enabled) {
      return fn(...args);
    }

    try {
      const cached = await getCached<TReturn>(cacheKey);
      if (cached !== null) {
        logger.debug('Cache hit', {
          context: 'cache-wrapper',
          metadata: { key: cacheKey },
        });
        return cached;
      }

      logger.debug('Cache miss', {
        context: 'cache-wrapper',
        metadata: { key: cacheKey },
      });
      const result = await fn(...args);

      try {
        await setCached(cacheKey, result, ttlMs);
      } catch (cacheError) {
        logger.warn('Failed to write to cache', {
          context: 'cache-wrapper',
          error: cacheError,
          metadata: { key: cacheKey },
        });
      }

      return result;
    } catch (error) {
      logger.warn('Cache error, falling back to direct call', {
        context: 'cache-wrapper',
        error,
        metadata: { key: cacheKey },
      });
      return fn(...args);
    }
  };
}

/**
 * Generates a cache key from prefix and arguments
 */
function generateCacheKey(prefix: string, args: unknown[]): string {
  const keyParts = args.map((arg) => {
    if (arg === null || arg === undefined) {
      return String(arg);
    }
    if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
      return String(arg);
    }
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, Object.keys(arg as Record<string, unknown>).sort());
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  });

  return `${prefix}:${keyParts.join(':')}`;
}
