import { fetchWithRetry } from './fetch-with-retry';

import { afterEach, describe, expect, it, vi } from 'vitest';

const originalFetch = globalThis.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
});

describe('fetchWithRetry', () => {
  it('returns response when fetch succeeds on first attempt', async () => {
    const response = { ok: true } as Response;
    const fetchMock = vi.fn().mockResolvedValue(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    const result = await fetchWithRetry('https://example.com');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(response);
  });

  it('retries on transient error and eventually succeeds', async () => {
    const response = { ok: true } as Response;
    const transientError = new Error('ECONNRESET') as NodeJS.ErrnoException;
    transientError.code = 'ECONNRESET';

    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce(response);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    const result = await fetchWithRetry('https://example.com', undefined, {
      maxAttempts: 2,
      initialDelayMs: 1,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toBe(response);
  });

  it('does not retry on non-transient error', async () => {
    const error = new Error('Permanent failure');
    const fetchMock = vi.fn().mockRejectedValue(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    await expect(
      fetchWithRetry('https://example.com', undefined, {
        maxAttempts: 3,
        initialDelayMs: 1,
      }),
    ).rejects.toBe(error);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws after maxAttempts of transient errors', async () => {
    const transientError = new Error('ECONNRESET') as NodeJS.ErrnoException;
    transientError.code = 'ECONNRESET';

    const fetchMock = vi.fn().mockRejectedValue(transientError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    await expect(
      fetchWithRetry('https://example.com', undefined, {
        maxAttempts: 2,
        initialDelayMs: 1,
      }),
    ).rejects.toBe(transientError);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

