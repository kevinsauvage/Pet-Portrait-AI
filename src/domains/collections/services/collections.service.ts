import config from '@/core/config';
import { logger } from '@/core/utils/logger';
import { storefrontSdk } from '@/infra/shopify/client';
import {
  adjustPaginationVariables,
  getMenuItemsForCollection,
  resolveSortKeyFromString,
} from '@/infra/shopify/helpers';
import {
  type CollectionQuery,
  CollectionSortKeys,
  type CollectionsQuery,
  type GetCollectionSeoByHandleQuery,
  type GetMenuByHandleQuery,
  ProductCollectionSortKeys,
} from '@/infra/shopify/storefront';

type CollectionEdge = CollectionsQuery['collections']['edges'][number];

type CollectionSearchParams = {
  after?: string;
  before?: string;
  sort_key?: string;
  reverse?: boolean;
};

type CollectionProducts = NonNullable<CollectionQuery['collection']>['products'];

type CollectionPageData = {
  collection: CollectionQuery['collection'] | null | undefined;
  edges: CollectionProducts['edges'];
  pageInfo: CollectionProducts['pageInfo'];
  sortKey: ProductCollectionSortKeys;
};

const DEFAULT_PAGE_INFO: CollectionProducts['pageInfo'] = {
  endCursor: null,
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
};

export async function getAllCollections(): Promise<CollectionEdge[]> {
  const response = await storefrontSdk().collections({
    first: 100,
    firstProducts: 1,
    identifiers: [],
    sortKey: CollectionSortKeys.Title,
  });

  return response.collections.edges;
}

export async function getCollectionSeo(
  handle: string,
): Promise<GetCollectionSeoByHandleQuery['collection'] | null | undefined> {
  const response = await storefrontSdk().getCollectionSeoByHandle({ handle });
  return response?.collection;
}

export async function getCollectionLayoutData(collectionSlug: string): Promise<{
  collection: CollectionQuery['collection'] | null | undefined;
  navMenu: GetMenuByHandleQuery['menu'] | null;
}> {
  const [responseMenu, responseCollection] = await Promise.all([
    storefrontSdk().getMenuByHandle({ handle: config.constants.menuHandles.main }),
    storefrontSdk().collection({
      first: 1,
      handle: collectionSlug,
      identifiers: [],
    }),
  ]);
  logger.debug('Collection layout data response menu', { context: 'getCollectionLayoutData', metadata: { responseMenu } });
  logger.debug('Collection layout data response collection', { context: 'getCollectionLayoutData', metadata: { responseCollection } });

  const navItems = getMenuItemsForCollection(responseMenu?.menu, collectionSlug);
  const navMenu = { items: navItems } as GetMenuByHandleQuery['menu'];

  return {
    collection: responseCollection.collection,
    navMenu,
  };
}

export async function getCollectionPageData(
  handle: string,
  searchParameters: CollectionSearchParams = {},
): Promise<CollectionPageData> {
  logger.debug('Collection page data', { context: 'getCollectionPageData', metadata: { handle } });
  const sortKey = resolveSortKeyFromString(
    searchParameters?.sort_key,
    ProductCollectionSortKeys,
    'BestSelling',
  );

  const response = await storefrontSdk().collection({
    ...adjustPaginationVariables({
      after: searchParameters?.after || undefined,
      before: searchParameters?.before || undefined,
      first: 16,
      last: 16,
      reverse: searchParameters?.reverse || false,
    }),
    handle,
    identifiers: [],
    sortKey,
  });

  const products = response.collection?.products;

  return {
    collection: response.collection,
    edges: products?.edges ?? [],
    pageInfo: products?.pageInfo ?? DEFAULT_PAGE_INFO,
    sortKey,
  };
}
