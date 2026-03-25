import { logger } from '@/core/utils/logger.server';
import { withRetry } from '@/core/utils/retry';
import { fetchTrustedHttpsImage } from '@/core/utils/trusted-https-image-host';
import { getShopConfig, type ShopConfig } from '@/domains/shop/get-shop-config.service';
import { getUploadUrl } from '@/infra/upload/get-upload-url';

import { AI_ART_STYLES, type ArtStyleId, type ArtworkGenerationResult } from './ai-portrait/types';

import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { UTApi, UTFile } from 'uploadthing/server';

const OPENAI_EDIT_URL = 'https://api.openai.com/v1/images/edits';

/** Legacy DALL·E 2 edits use a single `image` part; GPT image models require `image[]` (see OpenAI image edit API). */
function isDalle2ImageEditModel(model: string): boolean {
  return model.trim().toLowerCase() === 'dall-e-2';
}

function sourceImageFileInfo(contentType: string | null): { filename: string; blobType: string } {
  const mime = ((contentType ?? '').split(';')[0] ?? '').trim().toLowerCase();
  if (mime === 'image/png') return { filename: 'pet.png', blobType: 'image/png' };
  if (mime === 'image/webp') return { filename: 'pet.webp', blobType: 'image/webp' };
  return { filename: 'pet.jpg', blobType: 'image/jpeg' };
}

/**
 * Runs `fn` for each index in `[0, length)` with at most `concurrency` in flight.
 * Results are ordered by index.
 */
async function mapPool<R>(
  length: number,
  concurrency: number,
  fn: (index: number) => Promise<R>,
): Promise<R[]> {
  if (length <= 0) return [];
  const results: R[] = new Array(length);
  let next = 0;
  const workers = Math.min(Math.max(1, concurrency), length);

  async function worker() {
    while (true) {
      const i = next++;
      if (i >= length) return;
      results[i] = await fn(i);
    }
  }

  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}

/**
 * Gets the style prompt suffix for a given art style ID.
 *
 * @param styleId - The art style identifier
 * @returns The prompt suffix for the style, or a default portrait prompt
 */
function getStylePrompt(styleId: ArtStyleId): string {
  return (
    AI_ART_STYLES.find((s) => s.id === styleId)?.promptSuffix ?? 'as a beautiful artistic portrait'
  );
}

/**
 * Uploads a base64-encoded image to cloud storage.
 *
 * @param base64Data - Base64-encoded image data
 * @param fileName - Name for the uploaded file
 * @returns The public URL of the uploaded image
 * @throws {Error} If the upload fails or no URL is returned
 */
async function uploadBase64ToStorage(base64Data: string, fileName: string): Promise<string> {
  const buffer = Buffer.from(base64Data, 'base64');
  const utapi = new UTApi();
  const file = new UTFile([buffer], `generated_art/${fileName}`, { type: 'image/png' });
  const result = await utapi.uploadFiles([file]);
  const url = getUploadUrl(result[0]?.data);
  if (!url) throw new Error('Failed to upload generated image to storage');
  return url;
}

/**
 * Edits an image using OpenAI's image editing API with retry logic.
 * Uses in-memory source bytes (one copy per attempt for safe concurrent requests).
 *
 * @param apiKey - OpenAI API key
 * @param prompt - Style prompt describing the desired transformation
 * @param shopConfig - Validated shop config (timeouts, model, retries)
 * @param sourceImageBytes - Raw source image bytes from trusted HTTPS fetch
 * @param sourceContentType - Response `Content-Type` from the source image fetch (for correct multipart filename / MIME)
 * @returns Base64-encoded image data of the edited image
 * @throws {Error} If API call fails or no image data is returned
 */
async function editImageWithOpenAI(
  apiKey: string,
  prompt: string,
  shopConfig: ShopConfig,
  sourceImageBytes: Buffer,
  sourceContentType: string | null,
): Promise<string> {
  const {
    ai: { model, retry: retryConfig },
  } = shopConfig;
  const dalle2 = isDalle2ImageEditModel(model);
  const { filename, blobType } = sourceImageFileInfo(sourceContentType);

  const b64 = await withRetry(
    async () => {
      const imageBlob = new Blob([Buffer.from(sourceImageBytes)], { type: blobType });
      const form = new FormData();
      form.append('model', model);
      form.append('prompt', prompt);
      if (dalle2) {
        form.append('image', imageBlob, filename);
        form.append('response_format', 'b64_json');
      } else {
        form.append('image[]', imageBlob, filename);
        form.append('n', '1');
        form.append('output_format', 'png');
        form.append('input_fidelity', 'high');
      }

      const rsp = await fetch(OPENAI_EDIT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      });

      if (!rsp.ok) {
        const errText = await rsp.text();
        throw new Error(`OpenAI image edit failed: ${rsp.status} ${errText}`);
      }

      const json = (await rsp.json()) as { data?: Array<{ b64_json?: string | null }> };
      const data = json.data?.[0]?.b64_json ?? null;
      if (!data) throw new Error('No image data returned from OpenAI');
      return data;
    },
    {
      maxAttempts: retryConfig.maxAttempts,
      baseDelayMs: retryConfig.baseDelayMs,
      maxDelayMs: retryConfig.maxDelayMs,
      onAttemptFailed: (attempt, _maxAttempts, error) => {
        logger.error('OpenAI image edit attempt failed', {
          context: 'ai-portrait-generate',
          error,
          metadata: { attempt },
        });
        Sentry.captureException(error, { tags: { context: 'ai-portrait-generate', attempt } });
      },
    },
  );

  if (!b64) throw new Error('AI generation failed after retries');
  return b64;
}

/**
 * Generates multiple portrait variations of a pet photo in a specified art style.
 * Creates variations based on shop config, uploads them to storage, and logs the results.
 *
 * @param imageUrl - HTTPS URL of the source pet photo (fetched once per request; not stored on the customer)
 * @param styleId - Art style to apply (e.g., 'pixar', 'watercolor')
 * @returns Object containing the generated image URLs, generation ID, and style ID
 * @throws {Error} If OPENAI_API_KEY is not configured, generation fails, or upload fails
 *
 * @example
 * ```ts
 * const result = await generatePetPortraitVariations(
 *   'https://example.com/pet.jpg',
 *   'pixar'
 * );
 * logger.info('Portrait variations generated', { context: 'ai-portrait-generate', metadata: { urls: result.urls } });
 * ```
 */
export async function generatePetPortraitVariations(
  imageUrl: string,
  styleId: ArtStyleId,
): Promise<ArtworkGenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const shopConfig = await getShopConfig();
  const variationCount = shopConfig.ai.variationsCount;
  const concurrency = Math.min(shopConfig.ai.variationsConcurrency, variationCount);

  const generationId = randomUUID();
  const prompt = `Repaint this pet portrait ${getStylePrompt(styleId)}. Preserve the pet's breed, markings, eye color, and pose exactly. Fill the entire canvas. No text, no borders, no watermarks.`;

  try {
    const imageResponse = await fetchTrustedHttpsImage(imageUrl, {
      signal: AbortSignal.timeout(shopConfig.ai.apiTimeoutSeconds * 1000),
    });
    if (!imageResponse.ok)
      throw new Error(`Failed to fetch source image: ${imageResponse.status}`);
    const sourceImageBytes = Buffer.from(await imageResponse.arrayBuffer());
    const sourceContentType = imageResponse.headers.get('content-type');

    const b64List = await mapPool(variationCount, concurrency, () =>
      editImageWithOpenAI(apiKey, prompt, shopConfig, sourceImageBytes, sourceContentType),
    );

    const urls = await Promise.all(
      b64List.map((b64, i) =>
        uploadBase64ToStorage(b64, `generated-${generationId}-${i + 1}.png`),
      ),
    );
    return { urls, generationId, styleId };
  } catch (error) {
    let imageUrlHost: string | undefined;
    try {
      imageUrlHost = new URL(imageUrl).hostname;
    } catch {
      imageUrlHost = undefined;
    }
    logger.error('Pet portrait generation failed', {
      context: 'ai-portrait-generate',
      error,
      metadata: {
        generationId,
        styleId,
        imageUrlLength: imageUrl.length,
        imageUrlHost,
      },
    });
    throw error;
  }
}
