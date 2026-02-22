'use server';

import { IMAGE_CONSTRAINTS } from './types';

import sharp from 'sharp';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

export async function validateImageFromUrl(
  imageUrl: string,
): Promise<ImageValidationResult> {
  try {
    const response = await fetch(imageUrl, {
      headers: { Accept: 'image/*' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { valid: false, error: `Failed to fetch image: ${response.status}` };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!IMAGE_CONSTRAINTS.acceptedTypes.some((t) => contentType.includes(t))) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > IMAGE_CONSTRAINTS.maxFileSize) {
      return { valid: false, error: 'Image must be under 8MB' };
    }

    const metadata = await sharp(buffer).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;

    if (width < IMAGE_CONSTRAINTS.minDimension || height < IMAGE_CONSTRAINTS.minDimension) {
      return { valid: false, error: `Image must be at least ${IMAGE_CONSTRAINTS.minDimension}x${IMAGE_CONSTRAINTS.minDimension}px`, width, height };
    }

    if (width > IMAGE_CONSTRAINTS.maxDimension || height > IMAGE_CONSTRAINTS.maxDimension) {
      return { valid: false, error: `Image must not exceed ${IMAGE_CONSTRAINTS.maxDimension}x${IMAGE_CONSTRAINTS.maxDimension}px`, width, height };
    }

    const aspectRatio = width / height;
    if (aspectRatio < IMAGE_CONSTRAINTS.minAspectRatio || aspectRatio > IMAGE_CONSTRAINTS.maxAspectRatio) {
      return { valid: false, error: 'Image aspect ratio should be between 1:2 and 2:1', width, height };
    }

    return { valid: true, width, height };
  } catch (error) {
    return { valid: false, error: `Image validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
