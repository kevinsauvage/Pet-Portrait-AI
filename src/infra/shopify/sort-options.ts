import { ProductCollectionSortKeys, SearchSortKeys } from './storefront';

export const COLLECTION_SORT_OPTIONS = [
  {
    label: 'Best Selling',
    name: ProductCollectionSortKeys.BestSelling,
  },
  {
    label: 'Relevance',
    name: ProductCollectionSortKeys.Relevance,
  },
  {
    label: 'Price, low to high',
    name: ProductCollectionSortKeys.Price,
  },
  {
    label: 'New Arrivals',
    name: ProductCollectionSortKeys.Created,
  },
] as const;

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
