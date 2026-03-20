import {
  fetchTrustedHttpsImage,
  isTrustedHttpsImageHost,
} from './trusted-https-image-host';

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('isTrustedHttpsImageHost', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows UploadThing hosts', () => {
    expect(isTrustedHttpsImageHost('https://utfs.io/f/abc')).toBe(true);
    expect(isTrustedHttpsImageHost('https://x.utfs.io/f/abc')).toBe(true);
    expect(isTrustedHttpsImageHost('https://i5xe50sg8q.ufs.sh/f/abc')).toBe(true);
  });

  it('rejects non-HTTPS and invalid URLs', () => {
    expect(isTrustedHttpsImageHost('http://utfs.io/f/abc')).toBe(false);
    expect(isTrustedHttpsImageHost('not-a-url')).toBe(false);
    expect(isTrustedHttpsImageHost('https://evil.example/file')).toBe(false);
  });

  it('rejects URLs with userinfo', () => {
    expect(isTrustedHttpsImageHost('https://user:pass@utfs.io/f/x')).toBe(false);
  });

  it('allows hosts from ALLOWED_IMAGE_URL_HOSTS', () => {
    vi.stubEnv('ALLOWED_IMAGE_URL_HOSTS', 'cdn.example.com');
    expect(isTrustedHttpsImageHost('https://cdn.example.com/img.png')).toBe(true);
  });
});

describe('fetchTrustedHttpsImage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('follows redirects only to allowed hosts', async () => {
    const r1 = new Response(null, {
      status: 302,
      headers: { Location: 'https://utfs.io/f/final' },
    });
    const r2 = new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { 'content-type': 'image/png' },
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(r1)
      .mockResolvedValueOnce(r2);
    vi.stubGlobal('fetch', fetchMock);

    const rsp = await fetchTrustedHttpsImage('https://utfs.io/f/start');
    expect(rsp.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ redirect: 'manual' });
  });

  it('throws when redirect target is not allowed', async () => {
    const r1 = new Response(null, {
      status: 302,
      headers: { Location: 'https://evil.example/x' },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(r1));

    await expect(fetchTrustedHttpsImage('https://utfs.io/f/start')).rejects.toThrow(
      'disallowed host',
    );
  });
});
