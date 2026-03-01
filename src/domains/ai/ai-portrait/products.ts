export const PRODUCT_TYPES = [
  'digital',
  'canvas',
  'poster',
  'tshirt',
  'hoodie',
  'sticker',
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export const AI_PORTRAIT_PRODUCTS: Record<ProductType, { variantId: string }> = {
  digital: {
    variantId: process.env.NEXT_PUBLIC_AI_DIGITAL_VARIANT_ID ?? '',
  },
  canvas: {
    variantId: process.env.NEXT_PUBLIC_AI_CANVAS_VARIANT_ID ?? '',
  },
  poster: {
    variantId: process.env.NEXT_PUBLIC_AI_POSTER_VARIANT_ID ?? '',
  },
  tshirt: {
    variantId: process.env.NEXT_PUBLIC_AI_T_SHIRT_VARIANT_ID ?? '',
  },
  hoodie: {
    variantId: process.env.NEXT_PUBLIC_AI_HOODIE_VARIANT_ID ?? '',
  },
  sticker: {
    variantId: process.env.NEXT_PUBLIC_AI_STICKER_VARIANT_ID ?? '',
  },
};

export function isPhysicalProduct(type: ProductType): boolean {
  return type !== 'digital';
}
