import { NextRequest } from 'next/server';

import { requireApiProtection } from './auth';

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('requireApiProtection', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null when the secret env var is unset (no protection)', async () => {
    vi.stubEnv('AI_API_SECRET', '');

    const request = new NextRequest('https://app.example.com/api/ai/generate', {
      method: 'POST',
      headers: new Headers(),
    });

    await expect(
      requireApiProtection(request, { secretEnv: 'AI_API_SECRET', scope: 'ai' }),
    ).resolves.toBeNull();
  });

  it('returns 401 when secret is set, same-site, and there is no valid session or header', async () => {
    vi.stubEnv('AI_API_SECRET', 'test-ai-secret');

    const request = new NextRequest('https://app.example.com/api/ai/generate', {
      method: 'POST',
      headers: new Headers({
        'sec-fetch-site': 'same-origin',
      }),
    });

    const res = await requireApiProtection(request, {
      secretEnv: 'AI_API_SECRET',
      scope: 'ai',
    });

    expect(res).not.toBeNull();
    expect(res?.status).toBe(401);
  });

  it('returns null when Authorization Bearer matches the secret', async () => {
    vi.stubEnv('AI_API_SECRET', 'test-ai-secret');

    const request = new NextRequest('https://app.example.com/api/ai/generate', {
      method: 'POST',
      headers: new Headers({
        Authorization: 'Bearer test-ai-secret',
      }),
    });

    await expect(
      requireApiProtection(request, { secretEnv: 'AI_API_SECRET', scope: 'ai' }),
    ).resolves.toBeNull();
  });

  it('returns 403 for cross-site requests without a valid header', async () => {
    vi.stubEnv('AI_API_SECRET', 'test-ai-secret');

    const request = new NextRequest('https://app.example.com/api/ai/generate', {
      method: 'POST',
      headers: new Headers({
        'sec-fetch-site': 'cross-site',
      }),
    });

    const res = await requireApiProtection(request, {
      secretEnv: 'AI_API_SECRET',
      scope: 'ai',
    });

    expect(res).not.toBeNull();
    expect(res?.status).toBe(403);
  });
});
