/**
 * AI Pet Portrait product variant IDs from Shopify.
 * Create these products in Shopify Admin and set the variant IDs here or via env.
 */
export const AI_PORTRAIT_PRODUCTS = {
  digital: {
    variantId: process.env.NEXT_PUBLIC_AI_DIGITAL_VARIANT_ID ?? '',
    title: 'Digital AI Pet Portrait',
    price: '$29.99',
    description: 'High-resolution digital download delivered via email.',
    productType: 'digital' as const,
  },
  canvas: {
    variantId: process.env.NEXT_PUBLIC_AI_CANVAS_VARIANT_ID ?? '',
    title: 'Canvas Print',
    price: '$49–$109',
    description: 'Premium canvas print, multiple sizes. Shipped via Gelato.',
    productType: 'canvas' as const,
  },
  poster: {
    variantId: process.env.NEXT_PUBLIC_AI_POSTER_VARIANT_ID ?? '',
    title: 'Poster / Art Print',
    price: '$29–$79',
    description: 'High-quality art print. Shipped via Gelato.',
    productType: 'poster' as const,
  },
} as const;

export type AIProductType = 'digital' | 'canvas' | 'poster';
