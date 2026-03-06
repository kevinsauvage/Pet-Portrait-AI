import { storefrontSdk } from '@/infra/shopify/client';
import {
  CollectionSortKeys,
  type CollectionsQuery,
  type GetProductsQuery,
  ProductSortKeys,
} from '@/infra/shopify/generated/storefront/index';

type CollectionEdge = CollectionsQuery['collections']['edges'][number];

type ProductNode = GetProductsQuery['products']['edges'][number]['node'];

type HomePageData = {
  featuredCollections: CollectionEdge[];
  bestSellingProducts: ProductNode[];
  newArrivalProducts: ProductNode[];
};

export async function getHomePageData(): Promise<HomePageData> {
  const storefront = storefrontSdk();
  const [collections, bestSelling, newArrival] = await Promise.all([
    storefront.collections({
      first: 100,
      firstProducts: 1,
      identifiers: [{ key: 'featured', namespace: 'custom' }],
      sortKey: CollectionSortKeys.Relevance,
    }),
    storefront.getProducts({
      first: 8,
      identifiers: [],
      sortKey: ProductSortKeys.BestSelling,
    }),
    storefront.getProducts({
      first: 8,
      identifiers: [],
      sortKey: ProductSortKeys.CreatedAt,
    }),
  ]);

  const featuredCollections = collections.collections.edges.filter((collection) =>
    collection.node.metafields.find((metafield) => metafield?.key === 'featured'),
  );

  return {
    featuredCollections,
    bestSellingProducts: bestSelling.products.edges.map((edge) => edge.node),
    newArrivalProducts: newArrival.products.edges.map((edge) => edge.node),
  };
}
