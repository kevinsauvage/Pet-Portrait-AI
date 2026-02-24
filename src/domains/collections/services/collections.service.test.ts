import {
  getAllCollections,
  getCollectionLayoutData,
  getCollectionPageData,
  getCollectionSeo,
} from './collections.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    collections: vi.fn().mockResolvedValue({
      collections: { edges: [{ node: { id: 'col-1' } }] },
    }),
    getCollectionSeoByHandle: vi.fn().mockResolvedValue({
      collection: { title: 'Test Collection', description: 'Desc' },
    }),
    getMenuByHandle: vi.fn().mockResolvedValue({ menu: { items: [] } }),
    collection: vi.fn().mockResolvedValue({
      collection: {
        products: {
          edges: [],
          filters: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
        },
      },
    }),
  })),
}));

describe('collections.service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getAllCollections returns collection edges', async () => {
    const result = await getAllCollections();
    expect(result).toHaveLength(1);
    expect(result?.[0]?.node.id).toBe('col-1');
  });

  it('getCollectionSeo returns collection seo data', async () => {
    const result = await getCollectionSeo('test-handle');
    expect(result?.title).toBe('Test Collection');
  });

  it('getCollectionLayoutData returns collection and nav menu', async () => {
    const result = await getCollectionLayoutData('test');
    expect(result).toHaveProperty('collection');
    expect(result).toHaveProperty('navMenu');
  });

  it('getCollectionPageData returns page data with sortKey', async () => {
    const result = await getCollectionPageData('test');
    expect(result).toHaveProperty('collection');
    expect(result).toHaveProperty('edges');
    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('pageInfo');
    expect(result).toHaveProperty('sortKey');
  });
});
