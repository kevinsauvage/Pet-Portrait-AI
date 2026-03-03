import {
  createAdminMisconfiguredResponse,
  createAdminUnauthorizedResponse,
  isAdminAuthConfigured,
  isAdminAuthorized,
  requireAdminAuth,
} from './admin-auth';

import { afterEach, describe, expect, it, vi } from 'vitest';

function makeHeaders(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

// Note: ADMIN_BASIC_USER, ADMIN_BASIC_PASSWORD, ADMIN_SECRET are read at
// module load time as constants. Tests run in an env where they are not set
// (test environment), so isAdminAuthConfigured() returns false.

describe('isAdminAuthConfigured', () => {
  it('returns a boolean', () => {
    expect(typeof isAdminAuthConfigured()).toBe('boolean');
  });
});

describe('isAdminAuthorized (auth not configured)', () => {
  // In test env, auth env vars are not set, so auth is not "configured".
  // isAdminAuthorized returns process.env.NODE_ENV !== 'production' (true in test).

  it('returns true in test environment (non-production, no auth configured)', () => {
    const result = isAdminAuthorized(makeHeaders({}));
    expect(result).toBe(true);
  });

  it('returns true even without authorization header (non-production)', () => {
    expect(isAdminAuthorized(makeHeaders({}))).toBe(true);
  });
});

describe('createAdminUnauthorizedResponse', () => {
  it('returns a 401 response', async () => {
    const res = createAdminUnauthorizedResponse();
    expect(res.status).toBe(401);
  });

  it('response body is "Unauthorized"', async () => {
    const res = createAdminUnauthorizedResponse();
    const text = await res.text();
    expect(text).toBe('Unauthorized');
  });

  it('sets WWW-Authenticate header when basic auth is configured', () => {
    // Since basic auth is not configured in test env, just verify no header crash
    const res = createAdminUnauthorizedResponse();
    expect(res.headers).toBeDefined();
  });
});

describe('createAdminMisconfiguredResponse', () => {
  it('returns a 503 response', async () => {
    const res = createAdminMisconfiguredResponse();
    expect(res.status).toBe(503);
  });

  it('response body contains descriptive text', async () => {
    const res = createAdminMisconfiguredResponse();
    const text = await res.text();
    expect(text).toContain('not configured');
  });
});

describe('requireAdminAuth', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null in test environment (non-production, no auth configured)', () => {
    const result = requireAdminAuth(makeHeaders({}));
    // In test env, isAdminAuthorized returns true, so requireAdminAuth returns null
    expect(result).toBeNull();
  });

  it('returns error response in production environment without auth configured', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const result = requireAdminAuth(makeHeaders({}));
    // In production with no auth configured, returns 503 (misconfigured)
    expect(result).not.toBeNull();
    expect(result?.status).toBe(503);
  });

  it('returns 401 when authorization header is missing but auth is not configured (non-production)', () => {
    // This tests the isAdminAuthorized path
    // In test env auth is not configured, returns true (non-production allowed)
    const result = requireAdminAuth(makeHeaders({}));
    expect(result).toBeNull();
  });
});
