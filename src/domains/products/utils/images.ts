import type { ImageFieldsFragment } from '@/infra/shopify/storefront';

/**
 * Converts Shopify image URL to optimized format with WebP/AVIF support
 * Shopify CDN supports format conversion via URL parameters
 */
export function getOptimizedImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    quality?: number;
  },
): string {
  if (!url) return '';

  const { width, height, format, quality = 75 } = options || {};

  const params = new URLSearchParams();

  if (format) {
    params.append('format', format);
  }

  if (width) {
    params.append('width', width.toString());
  }

  if (height) {
    params.append('height', height.toString());
  }

  if (quality && quality !== 75) {
    params.append('quality', quality.toString());
  }

  const separator = url.includes('?') ? '&' : '?';
  return params.toString() ? `${url}${separator}${params.toString()}` : url;
}

export function generateImageSrcSet(
  baseUrl: string,
  sizes: number[] = [400, 600, 800, 1200, 1600],
  format?: 'webp' | 'avif',
): string {
  return sizes
    .map((size) => {
      const optimizedUrl = getOptimizedImageUrl(baseUrl, {
        width: size,
        format,
      });
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');
}

export function getImageSizeForViewport(viewport: 'mobile' | 'tablet' | 'desktop' | 'large'): {
  width: number;
  height?: number;
} {
  const sizes = {
    mobile: { width: 400 },
    tablet: { width: 500 },
    desktop: { width: 600 },
    large: { width: 1000 },
  };
  return sizes[viewport];
}

export function mapShopifyImageToImageFields(
  image: ImageFieldsFragment | null | undefined,
): ImageFields | null {
  if (!image) return null;

  return {
    altText: image.altText ?? null,
    blurDataURL: String(image.blurDataURL || ''),
    height: image.height ?? null,
    large: String(image.large || image.src || ''),
    medium: String(image.medium || image.src || ''),
    small: String(image.small || image.src || ''),
    src: String(image.src || image.url || ''),
    width: image.width ?? null,
  };
}

export function mapShopifyImagesToImageFields(
  images: Array<{ node: ImageFieldsFragment }> | null | undefined,
): ImageFields[] {
  if (!images || !Array.isArray(images)) return [];

  return images
    .map((edge) => mapShopifyImageToImageFields(edge.node))
    .filter((img): img is ImageFields => img !== null);
}
