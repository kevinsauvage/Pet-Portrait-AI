import type { MetadataRoute } from 'next';

import { sitemap as sitemapConfig } from '@/core/config';
import { fetchShopifySitemapEntries } from '@/infra/shopify/sitemap';
import { getBaseUrl } from '@/lib/server/metadata';

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
