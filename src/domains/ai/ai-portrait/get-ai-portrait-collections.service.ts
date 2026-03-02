import { storefrontSdk } from '@/infra/shopify/client';
import { CollectionSortKeys } from '@/infra/shopify/storefront';

export interface AiPortraitCollection {
  handle: string;
  title: string;
  description: string;
  image?: string;
}

export async function getAiPortraitCollections(): Promise<AiPortraitCollection[]> {
  const response = await storefrontSdk().collections({
    first: 100,
    firstProducts: 0,
    identifiers: [],
    sortKey: CollectionSortKeys.Title,
  });

  return response.collections.edges.map(({ node }) => ({
    handle: node.handle,
    title: node.title,
    description: node.description ?? '',
    image: node.image?.url ?? undefined,
  }));
}
