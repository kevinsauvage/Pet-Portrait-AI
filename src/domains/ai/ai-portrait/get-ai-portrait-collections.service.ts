import { storefrontSdk } from '@/infra/shopify/client';
import { CollectionSortKeys } from '@/infra/shopify/generated/storefront/index';

import type { AiPortraitCollection } from './types';

export type { AiPortraitCollection } from './types';

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
