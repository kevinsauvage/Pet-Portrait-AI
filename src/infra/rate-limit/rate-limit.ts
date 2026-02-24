import { Redis } from '@upstash/redis';

type RateLimitOptions = {
  windowMs?: number;
  maxRequests?: number;
  prefix?: string;
};

type RateLimitResult = { allowed: boolean; retryAfter?: number };

const DEFAULT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const DEFAULT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 5);

const {RATE_LIMIT_REDIS_URL} = process.env;
const {RATE_LIMIT_REDIS_TOKEN} = process.env;

const redisClient =
  RATE_LIMIT_REDIS_URL && RATE_LIMIT_REDIS_TOKEN
    ? new Redis({
        url: RATE_LIMIT_REDIS_URL,
        token: RATE_LIMIT_REDIS_TOKEN,
      })
    : null;

const inMemoryRequestCounts = new Map<string, { count: number; resetAt: number }>();

function getKey(identifier: string, options: RateLimitOptions): string {
  return options.prefix ? `${options.prefix}:${identifier}` : identifier;
}

async function checkRateLimitInRedis(
  identifier: string,
  options: RateLimitOptions = {},
): Promise<RateLimitResult> {
  if (!redisClient) {
    return checkRateLimitInMemory(identifier, options);
  }

  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const key = getKey(identifier, options);

  const count = await redisClient.incr(key);

  if (count === 1) {
    await redisClient.pexpire(key, windowMs);
  }

  if (count > maxRequests) {
    const ttlMs = await redisClient.pttl(key);
    const retryAfter =
      typeof ttlMs === 'number' && ttlMs > 0 ? Math.ceil(ttlMs / 1000) : Math.ceil(windowMs / 1000);

    return {
      allowed: false,
      retryAfter,
    };
  }

  return { allowed: true };
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
  if (!redisClient) {
    return checkRateLimitInMemory(identifier, options);
  }

  try {
    return await checkRateLimitInRedis(identifier, options);
  } catch {
    return checkRateLimitInMemory(identifier, options);
  }
}
