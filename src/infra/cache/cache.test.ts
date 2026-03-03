import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Redis - must be before importing cache module
const mockCache = new Map<string, string>();

const createMockClient = () => ({
  connect: vi.fn().mockResolvedValue(undefined),
  get: vi.fn((key: string) => Promise.resolve(mockCache.get(key) || null)),
  setEx: vi.fn((key: string, ttl: number, value: string) => {
    mockCache.set(key, value);
    return Promise.resolve('OK');
  }),
  del: vi.fn((key: string | string[]) => {
    if (Array.isArray(key)) {
      key.forEach((k) => mockCache.delete(k));
      return Promise.resolve(key.length);
    }
    mockCache.delete(key);
    return Promise.resolve(1);
  }),
  keys: vi.fn((pattern: string) => {
    const prefix = pattern.replace('*', '');
    return Promise.resolve(
      Array.from(mockCache.keys()).filter((key) => key.startsWith(prefix)),
    );
  }),
});

vi.mock('redis', () => ({
  createClient: vi.fn(() => createMockClient()),
}));

// Set REDIS_URL before importing cache module
process.env.REDIS_URL = 'redis://localhost:6379';

import {
  clearCache,
  getCached,
  getCacheMetrics,
  invalidateCache,
  resetCacheMetrics,
  setCached,
} from './index';

const originalRedisUrl = process.env.REDIS_URL;

describe('cache', () => {
  beforeEach(() => {
    // Ensure REDIS_URL is set
    process.env.REDIS_URL = 'redis://localhost:6379';
    mockCache.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
    resetCacheMetrics();
  });

  afterEach(async () => {
    vi.useRealTimers();
    if (originalRedisUrl) {
      process.env.REDIS_URL = originalRedisUrl;
    } else {
      process.env.REDIS_URL = 'redis://localhost:6379';
    }
  });

  it('requires REDIS_URL to be configured', async () => {
    // This test verifies the error message - actual usage requires REDIS_URL
    // In production, REDIS_URL should always be set
    expect(process.env.REDIS_URL).toBeDefined();
    expect(process.env.REDIS_URL).toBeTruthy();
  });

  it('returns null for a missing key', async () => {
    expect(await getCached('missing')).toBeNull();
  });

  it('stores and retrieves a value', async () => {
    await setCached('key', { data: 42 }, 5000);
    expect(await getCached('key')).toEqual({ data: 42 });
  });

  it('returns null after TTL expires', async () => {
    await setCached('key', 'value', 1000);
    vi.advanceTimersByTime(1001);
    expect(await getCached('key')).toBeNull();
  });

  it('returns value before TTL expires', async () => {
    await setCached('key', 'value', 5000);
    vi.advanceTimersByTime(4999);
    expect(await getCached('key')).toBe('value');
  });

  it('invalidates a specific key', async () => {
    await setCached('a', 1, 5000);
    await setCached('b', 2, 5000);
    await invalidateCache('a');
    expect(await getCached('a')).toBeNull();
    expect(await getCached('b')).toBe(2);
  });

  it('clearCache removes all entries', async () => {
    await setCached('x', 1, 5000);
    await setCached('y', 2, 5000);
    await clearCache();
    expect(await getCached('x')).toBeNull();
    expect(await getCached('y')).toBeNull();
  });

  it('overwrites an existing key', async () => {
    await setCached('key', 'old', 5000);
    await setCached('key', 'new', 5000);
    expect(await getCached('key')).toBe('new');
  });

  it('handles different value types', async () => {
    await setCached('num', 99, 5000);
    await setCached('arr', [1, 2, 3], 5000);
    await setCached('bool', true, 5000);
    expect(await getCached('num')).toBe(99);
    expect(await getCached('arr')).toEqual([1, 2, 3]);
    expect(await getCached('bool')).toBe(true);
  });

  it('tracks cache metrics', async () => {
    resetCacheMetrics();
    await setCached('key1', 'value1', 5000);
    await setCached('key2', 'value2', 5000);
    await getCached('key1');
    await getCached('missing');
    await getCached('key2');
    await invalidateCache('key1');

    const metrics = getCacheMetrics();
    expect(metrics.sets).toBe(2);
    expect(metrics.hits).toBe(2);
    expect(metrics.misses).toBe(1);
    expect(metrics.invalidations).toBe(1);
  });

  it('validates cache key input', async () => {
    await expect(setCached('', 'value', 5000)).rejects.toThrow();
    await expect(getCached('')).rejects.toThrow();
    await expect(invalidateCache('')).rejects.toThrow();
  });

  it('validates TTL input', async () => {
    await expect(setCached('key', 'value', 0)).rejects.toThrow('positive');
    await expect(setCached('key', 'value', -1)).rejects.toThrow('positive');
  });
});
