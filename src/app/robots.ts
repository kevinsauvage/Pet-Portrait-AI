import type { MetadataRoute } from 'next';

import { ROBOTS_RULES } from '@/core/config/robots';
import { getBaseUrl } from '@/lib/server/metadata';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: ROBOTS_RULES,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
