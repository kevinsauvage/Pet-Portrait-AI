import type { AiPortraitProductVariant } from '../types';

/**
 * Finds the lowest price among product variants
 */
export function getLowestPrice(variants: AiPortraitProductVariant[]): number {
  if (variants.length === 0) return 0;
  const firstVariant = variants[0];
  if (!firstVariant) return 0;
  return variants.reduce((min, v) => (v.price < min ? v.price : min), firstVariant.price);
}

/**
 * Finds the first available variant, or falls back to the first variant
 */
export function getFirstAvailableVariant(
  variants: AiPortraitProductVariant[],
): AiPortraitProductVariant | undefined {
  return variants.find((v) => v.availableForSale) ?? variants[0];
}
