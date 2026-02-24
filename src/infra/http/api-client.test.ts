import { apiClient } from './api-client';

import { afterEach, describe, expect, it, vi } from 'vitest';

const originalFetch = globalThis.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
});

describe('apiClient', () => {
  it('builds absolute URL for relative paths and returns data', async () => {
    const data = { foo: 'bar' };
    const jsonMock = vi.fn().mockResolvedValue(data);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: jsonMock,
    } as unknown as Response);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    const result = await apiClient<typeof data>('/api/test', { method: 'GET' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls?.[0] ?? [undefined, undefined];
    expect(url).toBe('https://example.com/api/test');
    expect((options as RequestInit).method).toBe('GET');
    expect(result).toEqual(data);
  });

  it('does not modify already absolute URLs', async () => {
    const data = { ok: true };
    const jsonMock = vi.fn().mockResolvedValue(data);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: jsonMock,
    } as unknown as Response);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    const absoluteUrl = 'https://api.other.com/resource';
    await apiClient(absoluteUrl, { method: 'GET' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls?.[0] ?? [undefined];
    expect(url).toBe(absoluteUrl);
  });

  it('throws using API error message when response is not ok', async () => {
    const errorResponse = { error: 'Bad things happened' };
    const jsonMock = vi.fn().mockResolvedValue(errorResponse);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: jsonMock,
    } as unknown as Response);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    await expect(apiClient('/api/fail', { method: 'GET' })).rejects.toThrow('Bad things happened');
  });

  it('throws when API returns error response shape', async () => {
    const errorResponse = { error: 'Application error' };
    const jsonMock = vi.fn().mockResolvedValue(errorResponse);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: jsonMock,
    } as unknown as Response);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    await expect(apiClient('/api/error', { method: 'GET' })).rejects.toThrow('Application error');
  });

  it('wraps non-Error throws in generic Error with cause', async () => {
    const originalError = 'boom';
    const fetchMock = vi.fn().mockRejectedValue(originalError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    let caught: unknown;
    try {
      await apiClient('/api/error', { method: 'GET' });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    const err = caught as Error & { cause?: unknown };
    expect(err.message).toBe('Unknown error occurred during API request');
    expect(err.cause).toBe(originalError);
  });
});
