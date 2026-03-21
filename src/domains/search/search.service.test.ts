import { PREDICTIVE_SEARCH_QUERY_MAX_LENGTH } from './predictive-search-query';
import { getPredictiveSearch, searchProducts } from './search.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/shop/get-shop-config.service', () => ({
  getShopConfig: vi.fn().mockResolvedValue({ pagination: { productsPerPage: 12 } }),
}));

const mockPredictiveSearch = vi.fn().mockResolvedValue({ suggestions: [] });
vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    predictiveSearch: mockPredictiveSearch,
    searchProducts: vi.fn().mockResolvedValue({
      search: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        productFilters: [],
      },
    }),
  })),
}));

describe('search.service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPredictiveSearch', () => {
    it('returns null for empty query', async () => {
      expect(await getPredictiveSearch('')).toBeNull();
      expect(await getPredictiveSearch('   ')).toBeNull();
    });

    it('returns null for query shorter than 2 chars', async () => {
      expect(await getPredictiveSearch('a')).toBeNull();
    });

    it('calls storefront when query is 2+ chars', async () => {
      await getPredictiveSearch('ab');
      expect(mockPredictiveSearch).toHaveBeenCalledWith({ query: 'ab' });
    });

    it('truncates query to max length before calling storefront', async () => {
      const long = `${'a'.repeat(PREDICTIVE_SEARCH_QUERY_MAX_LENGTH)}xyz`;
      await getPredictiveSearch(long);
      expect(mockPredictiveSearch).toHaveBeenCalledWith({
        query: 'a'.repeat(PREDICTIVE_SEARCH_QUERY_MAX_LENGTH),
      });
    });

    it('returns null when predictiveSearch returns null/undefined', async () => {
      mockPredictiveSearch.mockResolvedValueOnce(null);
      const result = await getPredictiveSearch('test');
      expect(result).toBeNull();
    });
  });

  describe('searchProducts', () => {
    it('returns products, filters, pageInfo and sortKey', async () => {
      const result = await searchProducts({ searchQuery: 'dog' });
      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('pageInfo');
      expect(result).toHaveProperty('sortKey');
      expect(Array.isArray(result.products)).toBe(true);
    });
  });
});
