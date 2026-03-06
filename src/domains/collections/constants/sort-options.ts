import { ProductCollectionSortKeys } from '@/infra/shopify/generated/storefront/index';

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
