import { clearCache, getCached, invalidateCache, setCached } from './index';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('in-memory cache', () => {
  beforeEach(() => {
    clearCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null for a missing key', () => {
    expect(getCached('missing')).toBeNull();
  });

  it('stores and retrieves a value', () => {
    setCached('key', { data: 42 }, 5000);
    expect(getCached('key')).toEqual({ data: 42 });
  });

  it('returns null after TTL expires', () => {
    setCached('key', 'value', 1000);
    vi.advanceTimersByTime(1001);
    expect(getCached('key')).toBeNull();
  });

  it('returns value before TTL expires', () => {
    setCached('key', 'value', 5000);
    vi.advanceTimersByTime(4999);
    expect(getCached('key')).toBe('value');
  });

  it('invalidates a specific key', () => {
    setCached('a', 1, 5000);
    setCached('b', 2, 5000);
    invalidateCache('a');
    expect(getCached('a')).toBeNull();
    expect(getCached('b')).toBe(2);
  });

  it('clearCache removes all entries', () => {
    setCached('x', 1, 5000);
    setCached('y', 2, 5000);
    clearCache();
    expect(getCached('x')).toBeNull();
    expect(getCached('y')).toBeNull();
  });

  it('overwrites an existing key', () => {
    setCached('key', 'old', 5000);
    setCached('key', 'new', 5000);
    expect(getCached('key')).toBe('new');
  });

  it('handles different value types', () => {
    setCached('num', 99, 5000);
    setCached('arr', [1, 2, 3], 5000);
    setCached('bool', true, 5000);
    expect(getCached('num')).toBe(99);
    expect(getCached('arr')).toEqual([1, 2, 3]);
    expect(getCached('bool')).toBe(true);
  });
});
