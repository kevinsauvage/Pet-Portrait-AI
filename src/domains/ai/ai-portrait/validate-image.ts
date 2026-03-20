'use server';

import { fetchTrustedHttpsImage, isTrustedHttpsImageHost } from '@/core/utils/trusted-https-image-host';
import { getShopConfig } from '@/domains/shop/get-shop-config.service';

import type { ImageValidationResult } from './types';

import sharp from 'sharp';

export type { ImageValidationResult } from './types';

export async function validateImageFromUrl(imageUrl: string): Promise<ImageValidationResult> {
  try {
    if (!isTrustedHttpsImageHost(imageUrl)) {
      return {
        valid: false,
        error:
          'Only HTTPS image URLs from allowed hosts are permitted (e.g. UploadThing). Configure ALLOWED_IMAGE_URL_HOSTS to allow additional origins.',
      };
    }

    const shopConfig = await getShopConfig();
    const imageConfig = shopConfig.image;

    const response = await fetchTrustedHttpsImage(imageUrl, {
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
