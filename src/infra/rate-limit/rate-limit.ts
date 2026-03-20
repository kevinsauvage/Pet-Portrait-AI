import { logger } from '@/core/utils/logger.server';

import { createClient } from 'redis';

let warnedProductionWithoutRedis = false;

function warnProductionWithoutRedis(): void {
  if (
    warnedProductionWithoutRedis ||
    process.env.NODE_ENV !== 'production' ||
    process.env.REDIS_URL ||
    process.env.VITEST === 'true'
  ) {
    return;
  }
  warnedProductionWithoutRedis = true;
  logger.warn(
    'REDIS_URL is not set in production: rate limits are in-memory per instance and not shared across instances. Set REDIS_URL for correct limiting when running multiple workers.',
    { context: 'rate-limit' },
  );
}

type RateLimitOptions = {
  windowMs?: number;
  maxRequests?: number;
  prefix?: string;
};

type RateLimitResult = { allowed: boolean; retryAfter?: number };

const DEFAULT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const DEFAULT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 5);

const { REDIS_URL } = process.env;

// Create Redis client if URL is provided (singleton pattern)
let redisClientPromise: Promise<ReturnType<typeof createClient>> | null = null;

function getRedisClient(): Promise<ReturnType<typeof createClient>> | null {
  if (!REDIS_URL) {
    return null;
  }

  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      const client = createClient({ url: REDIS_URL });
      await client.connect();
      return client;
    })();
  }

  return redisClientPromise;
}

const inMemoryRequestCounts = new Map<string, { count: number; resetAt: number }>();

function getKey(identifier: string, options: RateLimitOptions): string {
  return options.prefix ? `${options.prefix}:${identifier}` : identifier;
}

async function checkRateLimitInRedis(
  identifier: string,
  options: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const clientPromise = getRedisClient();
  if (!clientPromise) {
    return checkRateLimitInMemory(identifier, options);
  }

  try {
    const client = await clientPromise;
    const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
    const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
    const key = getKey(identifier, options);

    const count = await client.incr(key);

    if (count === 1) {
      await client.pExpire(key, windowMs);
    }

    if (count > maxRequests) {
      const ttlMs = await client.pTTL(key);
      const retryAfter =
        typeof ttlMs === 'number' && ttlMs > 0
          ? Math.ceil(ttlMs / 1000)
          : Math.ceil(windowMs / 1000);

      return {
        allowed: false,
        retryAfter,
      };
    }

    return { allowed: true };
  } catch {
    // Fallback to in-memory on Redis errors
    return checkRateLimitInMemory(identifier, options);
  }
}

function checkRateLimitInMemory(
  identifier: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const key = getKey(identifier, options);
  const now = Date.now();
  const record = inMemoryRequestCounts.get(key);

  if (!record) {
    inMemoryRequestCounts.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true };
  }

  if (now >= record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return { allowed: true };
}

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {},
): Promise<RateLimitResult> {
  if (!REDIS_URL) {
    warnProductionWithoutRedis();
    return checkRateLimitInMemory(identifier, options);
  }

  return checkRateLimitInRedis(identifier, options);
}
