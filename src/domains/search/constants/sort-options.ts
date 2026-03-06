import { SearchSortKeys } from '@/infra/shopify/generated/storefront/index';

export const SEARCH_SORT_OPTIONS = [
  {
    label: 'Relevance',
    name: SearchSortKeys.Relevance,
  },
  {
    label: 'Price, low to high',
    name: SearchSortKeys.Price,
  },
] as const;
