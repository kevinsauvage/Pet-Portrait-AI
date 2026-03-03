import {
  getCookieDomain,
  getSecureCookieOptions,
  getStandardCookieOptions,
  shouldUseSecureCookies,
} from './cookie-security';

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('shouldUseSecureCookies', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(shouldUseSecureCookies()).toBe(true);
  });

  it('returns false in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(shouldUseSecureCookies()).toBe(false);
  });
});

describe('getCookieDomain', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns NEXT_PUBLIC_SITE_DOMAIN in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_DOMAIN', 'example.com');
    expect(getCookieDomain()).toBe('example.com');
  });

  it('returns a value (or undefined) in development without throwing', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const domain = getCookieDomain();
    expect(typeof domain === 'string' || domain === undefined).toBe(true);
  });
});

describe('getSecureCookieOptions', () => {
  it('returns correct defaults', () => {
    const opts = getSecureCookieOptions();
    expect(opts.httpOnly).toBe(true);
    expect(opts.path).toBe('/');
    expect(opts.sameSite).toBe('lax');
    expect(typeof opts.secure).toBe('boolean');
  });

  it('applies custom path', () => {
    const opts = getSecureCookieOptions({ path: '/api' });
    expect(opts.path).toBe('/api');
  });

  it('applies maxAge when provided', () => {
    const opts = getSecureCookieOptions({ maxAge: 3600 });
    expect(opts.maxAge).toBe(3600);
  });

  it('omits maxAge when not provided', () => {
    const opts = getSecureCookieOptions();
    expect(opts.maxAge).toBeUndefined();
  });

  it('applies expires when provided', () => {
    const date = new Date('2030-01-01');
    const opts = getSecureCookieOptions({ expires: date });
    expect(opts.expires).toEqual(date);
  });
});

describe('getStandardCookieOptions', () => {
  it('returns correct defaults', () => {
    const opts = getStandardCookieOptions();
    expect(opts.path).toBe('/');
    expect(opts.sameSite).toBe('lax');
    expect(typeof opts.secure).toBe('boolean');
    expect(opts.httpOnly).toBeUndefined();
  });

  it('applies httpOnly when explicitly set', () => {
    const opts = getStandardCookieOptions({ httpOnly: true });
    expect(opts.httpOnly).toBe(true);
  });

  it('applies maxAge when provided', () => {
    const opts = getStandardCookieOptions({ maxAge: 7200 });
    expect(opts.maxAge).toBe(7200);
  });

  it('omits maxAge when not provided', () => {
    const opts = getStandardCookieOptions();
    expect(opts.maxAge).toBeUndefined();
  });
});
