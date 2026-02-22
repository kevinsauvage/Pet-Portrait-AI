/**
 * Simple in-memory rate limiter for AI generation.
 * For production at scale, use Redis (Vercel KV) or Upstash.
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // 5 generations per minute per IP

const requestCounts = new Map<string, { count: number; resetAt: number }>();

type RateLimitOptions = {
  windowMs?: number;
  maxRequests?: number;
  prefix?: string;
};

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {},
): { allowed: boolean; retryAfter?: number } {
  const windowMs = options.windowMs ?? RATE_LIMIT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? MAX_REQUESTS_PER_WINDOW;
  const key = options.prefix ? `${options.prefix}:${identifier}` : identifier;
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record) {
    requestCounts.set(key, {
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
