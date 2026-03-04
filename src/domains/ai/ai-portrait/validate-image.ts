'use server';

import { getShopConfig } from '@/domains/shop/services';

import sharp from 'sharp';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

/**
 * Validates that a URL is safe to fetch by checking the scheme is HTTPS.
 * This prevents SSRF attacks (file://, http://internal, etc.).
 *
 * Note: Users can only upload via UploadThing, which always returns HTTPS URLs.
 * This check provides defense-in-depth against SSRF if the API is called directly.
 */
function validateUrlScheme(url: string): { valid: boolean; error?: string } {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Only allow HTTPS URLs (prevents file://, http://internal, etc.)
  if (parsedUrl.protocol !== 'https:') {
    return {
      valid: false,
      error: `Only HTTPS URLs are allowed. Received: ${parsedUrl.protocol}`,
    };
  }

  return { valid: true };
}

export async function validateImageFromUrl(imageUrl: string): Promise<ImageValidationResult> {
  try {
    // Validate URL scheme before fetching (SSRF protection)
    const urlValidation = validateUrlScheme(imageUrl);
    if (!urlValidation.valid) {
      return { valid: false, error: urlValidation.error };
    }

    const shopConfig = await getShopConfig();
    const imageConfig = shopConfig.image;

    const response = await fetch(imageUrl, {
      headers: { Accept: 'image/*' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { valid: false, error: `Failed to fetch image: ${response.status}` };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!imageConfig.acceptedTypes.some((t) => contentType.includes(t))) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const maxFileSizeMB = Math.round(imageConfig.maxFileSize / (1024 * 1024));
    if (buffer.length > imageConfig.maxFileSize) {
      return { valid: false, error: `Image must be under ${maxFileSizeMB}MB` };
    }

    const metadata = await sharp(buffer).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;

    if (width < imageConfig.minDimension || height < imageConfig.minDimension) {
      return {
        valid: false,
        error: `Image must be at least ${imageConfig.minDimension}x${imageConfig.minDimension}px`,
        width,
        height,
      };
    }

    if (width > imageConfig.maxDimension || height > imageConfig.maxDimension) {
      return {
        valid: false,
        error: `Image must not exceed ${imageConfig.maxDimension}x${imageConfig.maxDimension}px`,
        width,
        height,
      };
    }

    const aspectRatio = width / height;
    if (aspectRatio < imageConfig.minAspectRatio || aspectRatio > imageConfig.maxAspectRatio) {
      return {
        valid: false,
        error: `Image aspect ratio should be between ${imageConfig.minAspectRatio}:1 and ${imageConfig.maxAspectRatio}:1`,
        width,
        height,
      };
    }

    return { valid: true, width, height };
  } catch (error) {
    return {
      valid: false,
      error: `Image validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
