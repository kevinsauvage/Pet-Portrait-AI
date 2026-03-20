/**
 * Printful Mockup Generator API client.
 * Generates dynamic product previews (portrait on product mockup).
 *
 * @see https://developers.printful.com/docs/#tag/Mockup-Generator-API
 * Requires: PRINTFUL_TOKEN (Bearer) and PRINTFUL_API_SECRET (preview route protection); both required in `src/env.ts`.
 */

import { sleep } from '@/core/utils/retry';
import { env } from '@/env';
import { fetchWithTimeout } from '@/infra/http/fetch-with-timeout';

import {
  MOCKUP_INITIAL_WAIT_MS,
  MOCKUP_POLL_ATTEMPTS,
  MOCKUP_POLL_INTERVAL_MS,
} from './constants';
import type {
  PrintfulCreateTaskResponse,
  PrintfulPreviewResult,
  PrintfulPrintfilesResponse,
  PrintfulTaskResultResponse,
} from './types';

const PRINTFUL_API_URL = 'https://api.printful.com';

interface PrintfulApiResponse<T> {
  code: number;
  result: T;
}

async function printfulFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetchWithTimeout(
    `${PRINTFUL_API_URL}${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${env.PRINTFUL_TOKEN}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    },
    { timeoutMs: 60000 },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Printful API error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as PrintfulApiResponse<T>;
  return json.result;
}

interface PrintfulVariantResponse {
  variant: {
    id: number;
    product_id: number;
    image?: string;
  };
}

/**
 * Get variant info including product_id (Catalog API).
 * Used to derive product_id from variant_id for mockup generation.
 */
export async function getVariant(variantId: number): Promise<{ productId: number } | null> {
  try {
    const result = await printfulFetch<PrintfulVariantResponse>(`/products/variant/${variantId}`);
    const productId = result?.variant?.product_id;
    return productId ? { productId } : null;
  } catch (error) {
    console.error('[Printful] Get variant failed:', error);
    return null;
  }
}

/**
 * Get print file dimensions for a product (needed for mockup generation)
 */
export async function getPrintfiles(productId: number): Promise<PrintfulPrintfilesResponse | null> {
  try {
    return await printfulFetch<PrintfulPrintfilesResponse>(
      `/mockup-generator/printfiles/${productId}`,
    );
  } catch (error) {
    console.error('[Printful] Get printfiles failed:', error);
    return null;
  }
}

/**
 * Generate a product mockup with the artwork.
 * Derives product_id from variant_id via Catalog API, then creates mockup task.
 * Flow: get variant -> get printfiles -> create task -> wait 10s -> poll for result (mockup URLs expire in 72h)
 */
export async function generateProductPreview(
  variantId: number,
  artworkUrl: string,
): Promise<PrintfulPreviewResult | null> {
  try {
    const variantInfo = await getVariant(variantId);
    if (!variantInfo) return null;

    const { productId } = variantInfo;
    const printfiles = await getPrintfiles(productId);
    if (!printfiles) return null;

    const placement = Object.keys(printfiles.available_placements)[0] ?? 'default';
    const printfile = printfiles.printfiles[0];
    if (!printfile) return null;

    const { width, height } = printfile;
    const position = {
      area_width: width,
      area_height: height,
      width,
      height,
      top: 0,
      left: 0,
    };

    const createRes = await printfulFetch<PrintfulCreateTaskResponse>(
      `/mockup-generator/create-task/${productId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          variant_ids: [variantId],
          format: 'jpg',
          files: [
            {
              placement,
              image_url: artworkUrl,
              position,
            },
          ],
        }),
      },
    );

    if (createRes.status === 'failed') return null;

    const taskKey = createRes.task_key;
    if (!taskKey) return null;

    await sleep(MOCKUP_INITIAL_WAIT_MS);

    for (let i = 0; i < MOCKUP_POLL_ATTEMPTS; i++) {
      // eslint-disable-next-line no-await-in-loop -- intentional poll loop
      const result = await printfulFetch<PrintfulTaskResultResponse>(
        `/mockup-generator/task?task_key=${encodeURIComponent(taskKey)}`,
      );

      if (result.status === 'completed' && result.mockups?.[0]?.mockup_url) {
        return { previewUrl: result.mockups[0].mockup_url };
      }

      if (result.status === 'failed') {
        console.error('[Printful] Mockup task failed:', result.error);
        return null;
      }

      if (i < MOCKUP_POLL_ATTEMPTS - 1) {
        // eslint-disable-next-line no-await-in-loop -- intentional poll loop
        await sleep(MOCKUP_POLL_INTERVAL_MS);
      }
    }

    return null;
  } catch (error) {
    console.error('[Printful] Preview generation error:', error);
    return null;
  }
}
