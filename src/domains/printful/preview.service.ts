import { getPreviewRequestKey } from '@/domains/printful/utils';
import { getCached, setCached } from '@/infra/cache';
import { PREVIEW_CACHE_PREFIX, PREVIEW_CACHE_TTL_MS } from '@/infra/printful/constants';
import { generateProductPreview } from '@/infra/printful/printful-api-client';
import type { PrintfulPreviewParams, PrintfulPreviewResult } from '@/infra/printful/types';

import { createHash } from 'crypto';

function getCacheKey(variantId: number, artworkUrl: string): string {
  const input = getPreviewRequestKey(variantId, artworkUrl);
  const hash = createHash('sha256').update(input).digest('hex').slice(0, 32);
  return `${PREVIEW_CACHE_PREFIX}${hash}`;
}

/**
 * Generate a Printful product mockup preview.
 * Derives product_id from variant_id via Printful Catalog API.
 * Uses cache when Redis is available.
 * Returns null if generation fails.
 */
export async function generatePreview(
  params: PrintfulPreviewParams,
): Promise<{ previewUrl: string | null }> {
  const { variantId, artworkUrl } = params;

  if (!variantId || !artworkUrl) {
    return { previewUrl: null };
  }

  const cacheKey = getCacheKey(variantId, artworkUrl);

  try {
    const cached = await getCached<PrintfulPreviewResult>(cacheKey);
    if (cached?.previewUrl) {
      return { previewUrl: cached.previewUrl };
    }
  } catch {
    // Redis not configured - continue without cache
  }

  const result = await generateProductPreview(variantId, artworkUrl);

  if (result?.previewUrl) {
    try {
      await setCached(cacheKey, result, PREVIEW_CACHE_TTL_MS);
    } catch {
      // Cache write failed
    }
    return { previewUrl: result.previewUrl };
  }

  return { previewUrl: null };
}
