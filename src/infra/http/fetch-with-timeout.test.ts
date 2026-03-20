import { fetchWithTimeout } from './fetch-with-timeout';

import { afterEach, describe, expect, it, vi } from 'vitest';

const originalFetch = globalThis.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
});

describe('fetchWithTimeout', () => {
  it('returns response when fetch succeeds', async () => {
    const response = { ok: true } as Response;
    const fetchMock = vi.fn().mockResolvedValue(response);
    (globalThis as unknown as { fetch: typeof fetchMock }).fetch = fetchMock;

    const result = await fetchWithTimeout('https://example.com');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(response);
  });

  it('propagates fetch errors (no retry)', async () => {
    const transientError = new Error('ECONNRESET') as NodeJS.ErrnoException;
    transientError.code = 'ECONNRESET';

    const fetchMock = vi.fn().mockRejectedValue(transientError);
    (globalThis as unknown as { fetch: typeof fetchMock }).fetch = fetchMock;

    await expect(fetchWithTimeout('https://example.com')).rejects.toBe(transientError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
