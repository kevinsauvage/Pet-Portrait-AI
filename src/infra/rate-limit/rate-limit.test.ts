import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Ensure no REDIS_URL so we always use in-memory path
vi.stubEnv('REDIS_URL', '');

// Import after stubbing so module picks up the env state
const { checkRateLimit } = await import('./rate-limit');

describe('checkRateLimit (in-memory)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows first request within window', async () => {
    const result = await checkRateLimit('user-1', {
      windowMs: 60_000,
      maxRequests: 3,
      prefix: 'test-allow-first',
    });
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBeUndefined();
  });

  it('allows requests up to the max limit', async () => {
    const opts = { windowMs: 60_000, maxRequests: 3, prefix: 'test-up-to-max' };
    await checkRateLimit('userA', opts);
    await checkRateLimit('userA', opts);
    const third = await checkRateLimit('userA', opts);
    expect(third.allowed).toBe(true);
  });

  it('blocks requests exceeding the max limit', async () => {
    const opts = { windowMs: 60_000, maxRequests: 2, prefix: 'test-block' };
    await checkRateLimit('userB', opts);
    await checkRateLimit('userB', opts);
    const third = await checkRateLimit('userB', opts);
    expect(third.allowed).toBe(false);
    expect(third.retryAfter).toBeGreaterThan(0);
  });

  it('resets the counter after the window expires', async () => {
    const opts = { windowMs: 1000, maxRequests: 1, prefix: 'test-reset' };
    await checkRateLimit('userC', opts);
    const blocked = await checkRateLimit('userC', opts);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(1001);

    const reset = await checkRateLimit('userC', opts);
    expect(reset.allowed).toBe(true);
  });

  it('tracks different identifiers independently', async () => {
    const opts = { windowMs: 60_000, maxRequests: 1, prefix: 'test-independent' };
    const r1 = await checkRateLimit('idX', opts);
    const r2 = await checkRateLimit('idY', opts);
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });
});
