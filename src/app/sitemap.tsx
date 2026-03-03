import type { MetadataRoute } from 'next';

import { sitemap as sitemapConfig } from '@/core/config';
import { logger } from '@/core/utils/logger';
import { getBaseUrl } from '@/core/utils/metadata';
import { fetchShopifySitemapEntries } from '@/infra/shopify/sitemap';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const baseSitemap: MetadataRoute.Sitemap = sitemapConfig.map((item) => ({
    changeFrequency: item.changeFrequency,
    lastModified: item.lastModified,
    priority: item.priority,
    url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
  }));

  try {
    const { products, collections } = await fetchShopifySitemapEntries({ revalidate });

    const toEntry = (
      item: { handle: string; updatedAt?: string },
      pathPrefix: string,
      freq: 'daily' | 'weekly',
      priority: number,
    ): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}${pathPrefix}/${item.handle}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      changeFrequency: freq,
      priority,
    });

    const productCollectionSlug = (
      p: { collections?: { edges?: Array<{ node?: { handle?: string } }> } },
    ) => p.collections?.edges?.[0]?.node?.handle ?? 'all';

    return [
      ...baseSitemap,
      ...collections.map((c) => toEntry(c, '/shop', 'daily', 0.8)),
      ...products.map((p) =>
        toEntry(
          { handle: p.handle, updatedAt: p.updatedAt },
          `/shop/${productCollectionSlug(p)}`,
          'weekly',
          0.7,
        ),
      ),
    ];
  } catch (error) {
    logger.error('Failed to generate sitemap', { context: 'sitemap', error });
    return baseSitemap;
  }
}
