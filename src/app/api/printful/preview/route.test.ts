import type { NextRequest } from 'next/server';

import { generatePreview } from '@/domains/printful/preview.service';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';

import { POST } from './route';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/printful/preview.service', () => ({
  generatePreview: vi.fn(),
}));

vi.mock('@/infra/rate-limit/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

const mockRequireApiProtection = vi.fn().mockResolvedValue(null);

vi.mock('@/core/utils/auth', () => ({
  requireApiProtection: (...args: unknown[]) => mockRequireApiProtection(...args),
}));

vi.mock('@/core/utils/request-identity', () => ({
  getClientContext: vi.fn(() => ({ identifier: 'test-id' })),
}));

vi.mock('@/domains/shop/get-shop-config.service', () => ({
  getShopConfig: vi.fn().mockResolvedValue({
    rateLimit: {
      printful: { maxRequests: 30, windowMs: 60_000 },
    },
  }),
}));

describe('POST /api/printful/preview', () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, retryAfter: 0 });
    mockRequireApiProtection.mockResolvedValue(null);
    vi.mocked(generatePreview).mockResolvedValue({ previewUrl: 'https://pf.example/m.png' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function previewRequest(body: unknown): NextRequest {
    return {
      json: vi.fn().mockResolvedValue(body),
      headers: new Headers(),
    } as unknown as NextRequest;
  }

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, retryAfter: 42 });

    const response = await POST(previewRequest({ variantId: 1, artworkUrl: 'https://utfs.io/f/x' }));

    expect(response.status).toBe(429);
    expect(generatePreview).not.toHaveBeenCalled();
  });

  it('returns auth error from requireApiProtection', async () => {
    mockRequireApiProtection.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );

    const response = await POST(previewRequest({ variantId: 1, artworkUrl: 'https://utfs.io/f/x' }));

    expect(response.status).toBe(401);
    expect(generatePreview).not.toHaveBeenCalled();
  });

  it('returns 400 when artwork host is not allowlisted', async () => {
    const response = await POST(
      previewRequest({
        variantId: 1,
        artworkUrl: 'https://evil.example.com/a.png',
      }),
    );

    expect(response.status).toBe(400);
    expect(generatePreview).not.toHaveBeenCalled();
  });

  it('returns 200 and preview URL when valid', async () => {
    const response = await POST(
      previewRequest({
        variantId: 42,
        artworkUrl: 'https://utfs.io/f/abc',
      }),
    );

    expect(response.status).toBe(200);
    expect(generatePreview).toHaveBeenCalledWith({
      variantId: 42,
      artworkUrl: 'https://utfs.io/f/abc',
    });
    const body = (await (response as Response).json()) as { data: { previewUrl: string | null } };
    expect(body.data.previewUrl).toBe('https://pf.example/m.png');
  });
});
