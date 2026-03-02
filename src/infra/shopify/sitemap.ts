import { logger } from '@/core/utils/logger';
import { getStorefrontAccessToken } from '@/infra/shopify/tokens/storefront-token';

import { GraphQLClient } from 'graphql-request';
import gql from 'graphql-tag';

const PAGE_SIZE = 50;
const MAX_ERRORS = 3;

const GET_PRODUCTS_FOR_SITEMAP = gql`
  query getProductsForSitemap($first: Int, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

const GET_COLLECTIONS_FOR_SITEMAP = gql`
  query getCollectionsForSitemap($first: Int, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

type SitemapNode = { handle: string; updatedAt?: string };
type PageInfo = { hasNextPage: boolean; endCursor: string | null };
type PaginatedResponse<K extends string> = Record<
  K,
  {
    pageInfo: PageInfo;
    edges: Array<{ node: SitemapNode }>;
  }
>;

type SitemapFetchOptions = {
  revalidate: number;
};

const createSitemapClient = (revalidate: number): GraphQLClient => {
  const shopifyUrl = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL;
  if (!shopifyUrl) throw new Error('Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL');

  return new GraphQLClient(shopifyUrl, {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = await getStorefrontAccessToken();
      const headers = new Headers(init?.headers);
      headers.set('Content-Type', 'application/json');
      headers.set('X-Shopify-Storefront-Access-Token', token);
      const response = await fetch(input, { ...init, headers, next: { revalidate } });
      if (!response.ok) throw new Error(`Shopify API error: ${response.statusText}`);
      return response;
    },
    headers: { 'Content-Type': 'application/json' },
  });
};

const fetchAll = async <K extends string>(
  client: GraphQLClient,
  query: ReturnType<typeof gql>,
  key: K,
): Promise<SitemapNode[]> => {
  const items: SitemapNode[] = [];
  let cursor: string | null = null;
  let errors = 0;

  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response: PaginatedResponse<K> = await client.request<PaginatedResponse<K>>(query, {
        first: PAGE_SIZE,
        after: cursor || undefined,
      });

      const data: PaginatedResponse<K>[K] = response[key];
      items.push(
        ...data.edges
          .map((edge: { node: SitemapNode }) => edge.node)
          .filter((node: SitemapNode) => node.handle),
      );
      errors = 0;

      if (!data.pageInfo.hasNextPage) break;
      cursor = data.pageInfo.endCursor;

      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 100)); // eslint-disable-line no-await-in-loop
    } catch (error) {
      errors += 1;
      if (items.length > 0 || errors >= MAX_ERRORS) break;
      logger.warn(`Failed to fetch sitemap data for ${key}`, { context: `sitemap.fetchAll.${key}`, error });
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (errors - 1))); // eslint-disable-line no-await-in-loop
    }
  }

  return items;
};

export const fetchShopifySitemapEntries = async (
  options: SitemapFetchOptions,
): Promise<{ products: SitemapNode[]; collections: SitemapNode[] }> => {
  const client = createSitemapClient(options.revalidate);

  const [productsResult, collectionsResult] = await Promise.allSettled([
    fetchAll(client, GET_PRODUCTS_FOR_SITEMAP, 'products'),
    fetchAll(client, GET_COLLECTIONS_FOR_SITEMAP, 'collections'),
  ]);

  return {
    products: productsResult.status === 'fulfilled' ? productsResult.value : [],
    collections: collectionsResult.status === 'fulfilled' ? collectionsResult.value : [],
  };
};
