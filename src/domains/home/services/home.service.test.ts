import { getHomePageData } from './home.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    collections: vi.fn().mockResolvedValue({
      collections: {
        edges: [
          {
            node: {
              metafields: [{ key: 'featured', value: 'true' }],
            },
          },
          {
            node: {
              metafields: [],
            },
          },
        ],
      },
    }),
    getProducts: vi.fn().mockResolvedValue({
      products: {
        edges: [{ node: { id: 'prod-1' } }, { node: { id: 'prod-2' } }],
      },
    }),
  })),
}));

describe('home.service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns featured collections, best selling and new arrival products', async () => {
    const result = await getHomePageData();
    expect(result).toHaveProperty('featuredCollections');
    expect(result).toHaveProperty('bestSellingProducts');
    expect(result).toHaveProperty('newArrivalProducts');
    expect(result.featuredCollections.length).toBe(1);
    expect(result.bestSellingProducts).toHaveLength(2);
    expect(result.newArrivalProducts).toHaveLength(2);
  });
});
