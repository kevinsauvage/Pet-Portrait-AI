import type { MetadataRoute } from 'next';

import { sitemap as sitemapConfig } from '@/core/config';
import { getStorefrontAccessToken } from '@/infra/shopify/tokens/storefront-token';
import { getBaseUrl } from '@/lib/server/metadata';

import { GraphQLClient } from 'graphql-request';
import gql from 'graphql-tag';

export const dynamic = 'force-static';
export const revalidate = 3600;

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

function createSitemapClient(): GraphQLClient {
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
}

const sitemapClient = createSitemapClient();

async function fetchAll<K extends string>(
  query: ReturnType<typeof gql>,
  key: K,
): Promise<SitemapNode[]> {
  const items: SitemapNode[] = [];
  let cursor: string | null = null;
  let errors = 0;

  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response: PaginatedResponse<K> = await sitemapClient.request<PaginatedResponse<K>>(
        query,
        {
          first: PAGE_SIZE,
          after: cursor || undefined,
        },
      );

      const data: PaginatedResponse<K>[K] = response[key];
      items.push(
        ...data.edges
          .map((e: { node: SitemapNode }) => e.node)
          .filter((n: SitemapNode) => n.handle),
      );
      errors = 0;

      if (!data.pageInfo.hasNextPage) break;
      cursor = data.pageInfo.endCursor;

      // eslint-disable-next-line no-promise-executor-return
      await new Promise((r) => setTimeout(r, 100)); // eslint-disable-line no-await-in-loop
    } catch (error) {
      errors++;
      if (items.length > 0 || errors >= MAX_ERRORS) break;
      console.warn(`Error fetching ${key}:`, error instanceof Error ? error.message : error);
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (errors - 1))); // eslint-disable-line no-await-in-loop
    }
  }

  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const baseSitemap: MetadataRoute.Sitemap = sitemapConfig.map((item) => ({
    changeFrequency: item.changeFrequency,
    lastModified: item.lastModified,
    priority: item.priority,
    url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
  }));

  try {
    const [productsResult, collectionsResult] = await Promise.allSettled([
      fetchAll(GET_PRODUCTS_FOR_SITEMAP, 'products'),
      fetchAll(GET_COLLECTIONS_FOR_SITEMAP, 'collections'),
    ]);

    const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
    const collections = collectionsResult.status === 'fulfilled' ? collectionsResult.value : [];

    const toEntry = (
      item: SitemapNode,
      pathPrefix: string,
      freq: 'daily' | 'weekly',
      priority: number,
    ): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}${pathPrefix}/${item.handle}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      changeFrequency: freq,
      priority,
    });

    return [
      ...baseSitemap,
      ...collections.map((c) => toEntry(c, '/shop', 'daily', 0.8)),
      ...products.map((p) => toEntry(p, '/shop/products', 'weekly', 0.7)),
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return baseSitemap;
  }
}
