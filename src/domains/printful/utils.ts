/**
 * Printful catalog variant ID extraction from Shopify product data.
 * Printful sync adds SKU as {product_id}_{variant_id} (e.g. 6868817_22791).
 * The part after the underscore is the Printful catalog variant ID for the Mockup API.
 * Note: Printful dashboard shows Shopify variant ID (#53985903706441), NOT the catalog ID.
 */

/** Printful catalog IDs are typically 4–6 digits; Shopify IDs are 13+ digits */
export function isLikelyPrintfulCatalogId(value: number): boolean {
  return value > 0 && value < 10_000_000;
}

/** Extract Printful catalog variant ID from SKU (format: {product_id}_{variant_id}) */
export function getPrintfulVariantIdFromSku(
  sku: string | null | undefined,
): number | undefined {
  if (!sku?.trim()) return undefined;
  const parts = sku.trim().split('_');
  const lastPart = parts[parts.length - 1];
  if (!lastPart) return undefined;
  const id = parseInt(lastPart, 10);
  return Number.isNaN(id) ? undefined : id;
}

export interface PrintfulVariantIdSource {
  metafields?: Array<{ namespace: string; key: string; value: string } | null>;
  sku?: string | null;
}

/**
 * Resolve Printful catalog variant ID from metafield (custom.variant_id) or SKU.
 * Returns undefined if no valid ID found.
 */
export function getPrintfulVariantId(source: PrintfulVariantIdSource): number | undefined {
  const variantIdMetafield = source.metafields?.find(
    (mf) => mf?.namespace === 'custom' && mf?.key === 'variant_id',
  );
  const metafieldValue = variantIdMetafield?.value
    ? parseInt(variantIdMetafield.value, 10)
    : undefined;

  if (metafieldValue && !Number.isNaN(metafieldValue) && isLikelyPrintfulCatalogId(metafieldValue)) {
    return metafieldValue;
  }
  return getPrintfulVariantIdFromSku(source.sku);
}

/** Request key for preview deduplication and cache (variantId:artworkUrl) */
export function getPreviewRequestKey(variantId: number, artworkUrl: string): string {
  return `${variantId}:${artworkUrl}`;
}
