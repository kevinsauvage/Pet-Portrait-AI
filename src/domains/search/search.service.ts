import { getShopConfig } from '@/domains/shop/get-shop-config.service';
import { storefrontSdk } from '@/infra/shopify/client';
import type {
  ProductFieldsFragment,
  SearchProductsQuery,
} from '@/infra/shopify/generated/storefront/index';
import { SearchSortKeys } from '@/infra/shopify/generated/storefront/index';
import {
  adjustPaginationVariables,
  buildShopifySearchQuery,
  parseFiltersQuery,
  resolveSortKeyFromString,
} from '@/infra/shopify/helpers';

import type { SearchParameters } from './types';

export type { SearchParameters } from './types';

type SearchResults = {
  products: ProductFieldsFragment[];
  filters: SearchProductsQuery['search']['productFilters'];
  pageInfo: SearchProductsQuery['search']['pageInfo'];
  sortKey: SearchSortKeys;
};

export async function searchProducts(searchParameters: SearchParameters): Promise<SearchResults> {
  const shopConfig = await getShopConfig();
  const sortKey = resolveSortKeyFromString(searchParameters?.sort_key, SearchSortKeys, 'Relevance');

  const response: SearchProductsQuery = await storefrontSdk().searchProducts({
    ...adjustPaginationVariables({
      after: searchParameters.after,
      before: searchParameters.before,
      first: shopConfig.pagination.productsPerPage,
    }),
    identifiers: [],
    productFilters: parseFiltersQuery(searchParameters?.filters),
    query: buildShopifySearchQuery(searchParameters.searchQuery),
    sortKey,
  });

  return {
    pageInfo: response.search.pageInfo,
    filters: response.search.productFilters,
    products: response.search.edges.map((edge) => ({ ...edge.node })) as ProductFieldsFragment[],
    sortKey,
  };
}

export async function getPredictiveSearch(query: string) {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) {
    return null;
  }

  const response = await storefrontSdk().predictiveSearch({ query: trimmed });
  return response || null;
}
