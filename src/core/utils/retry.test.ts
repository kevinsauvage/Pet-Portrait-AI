import { withRetry } from './retry';

import { describe, expect, it, vi } from 'vitest';

describe('withRetry', () => {
  it('returns result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    const result = await withRetry(fn, { maxAttempts: 3 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries when fn throws and eventually succeeds', async () => {
    const error = new Error('temporary failure');
    const fn = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('ok');

    const onAttemptFailed = vi.fn();

    const result = await withRetry(fn, {
      maxAttempts: 2,
      baseDelayMs: 1,
      maxDelayMs: 1,
      onAttemptFailed,
    });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(onAttemptFailed).toHaveBeenCalledTimes(1);
    expect(onAttemptFailed).toHaveBeenCalledWith(1, 2, error);
  });

  it('returns last result when isSuccess is never satisfied', async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, value: 1 })
      .mockResolvedValueOnce({ ok: false, value: 2 });

    const onAttemptFailed = vi.fn();

    const result = await withRetry(fn, {
      maxAttempts: 2,
      baseDelayMs: 1,
      maxDelayMs: 1,
      isSuccess: (res: { ok: boolean; value: number }): boolean => res.ok,
      onAttemptFailed,
    });

    expect(result).toEqual({ ok: false, value: 2 });
    expect(onAttemptFailed).toHaveBeenCalledTimes(2);
  });

  it('returns undefined when all attempts throw', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('permanent failure'));

    const result = await withRetry(fn, {
      maxAttempts: 2,
      baseDelayMs: 1,
      maxDelayMs: 1,
    });

    expect(result).toBeUndefined();
  });
});
