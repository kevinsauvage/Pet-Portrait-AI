import type { NextRequest } from 'next/server';

import { getPredictiveSearch } from '@/domains/search/search.service';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';

import { GET } from './route';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/search/search.service', () => ({
  getPredictiveSearch: vi.fn(),
}));

vi.mock('@/infra/rate-limit/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock('@/core/utils/request-identity', () => ({
  getClientContext: vi.fn(() => ({ identifier: 'test-id' })),
}));

vi.mock('@/domains/shop/get-shop-config.service', () => ({
  getShopConfig: vi.fn().mockResolvedValue({
    rateLimit: {
      search: { maxRequests: 45, windowMs: 60_000 },
    },
    cache: {
      revalidate: { search: 300 },
    },
  }),
}));

describe('GET /api/search/predictive', () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, retryAfter: 0 });
    vi.mocked(getPredictiveSearch).mockResolvedValue({ predictiveSearch: { queries: [] } } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function predictiveRequest(q: string | null): NextRequest {
    const url = new URL('http://localhost/api/search/predictive');
    if (q !== null) url.searchParams.set('q', q);
    return { headers: new Headers(), nextUrl: url } as unknown as NextRequest;
  }

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, retryAfter: 12 });

    const response = await GET(predictiveRequest('ab'));

    expect(response.status).toBe(429);
    expect(getPredictiveSearch).not.toHaveBeenCalled();
  });

  it('calls getPredictiveSearch with raw q param', async () => {
    await GET(predictiveRequest('  hats  '));

    expect(getPredictiveSearch).toHaveBeenCalledWith('  hats  ');
  });

  it('sets private Cache-Control from shop search revalidate', async () => {
    const response = await GET(predictiveRequest('ab'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe(
      'private, max-age=120, stale-while-revalidate=480',
    );
  });
});
