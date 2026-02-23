import config from '@/core/config';
import { storefrontSdk } from '@/infra/shopify/client';
import { adjustPaginationVariables, buildShopifySearchQuery, parseFiltersQuery } from '@/infra/shopify/helpers';
import type { ProductFieldsFragment, SearchProductsQuery } from '@/infra/shopify/storefront';
import { SearchSortKeys } from '@/infra/shopify/storefront';

export type SearchParameters = {
  searchQuery: string;
  after?: string;
  before?: string;
  sort_key?: string;
  filters?: string;
  reverse?: boolean;
};

type SearchResults = {
  products: ProductFieldsFragment[];
  filters: SearchProductsQuery['search']['productFilters'];
  pageInfo: SearchProductsQuery['search']['pageInfo'];
  sortKey: SearchSortKeys;
};

const resolveSortKey = (sortKey?: string): SearchSortKeys => {
  const match = Object.values(SearchSortKeys).find(
    (item) => item.toLowerCase() === sortKey?.toLowerCase(),
  );
  if (match) return match;

  const matchKey = Object.keys(SearchSortKeys).find(
    (item) => item.toLowerCase() === sortKey?.toLowerCase(),
  ) as keyof typeof SearchSortKeys | undefined;

  if (matchKey) return SearchSortKeys[matchKey];

  return SearchSortKeys.Relevance;
};

export async function searchProducts(searchParameters: SearchParameters): Promise<SearchResults> {
  const sortKey = resolveSortKey(searchParameters?.sort_key);

  const response: SearchProductsQuery = await storefrontSdk().searchProducts({
    ...adjustPaginationVariables({
      after: searchParameters.after,
      before: searchParameters.before,
      first: config.constants.pagination.productsPerPage,
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
