export interface AiPortraitProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  currencyCode: string;
  availableForSale: boolean;
  /** Printful variant ID for mockup generation */
  printfulVariantId?: number;
}

export interface AiPortraitProduct {
  shopifyProductId: string;
  handle: string;
  title: string;
  description: string;
  image?: string;
  variants: AiPortraitProductVariant[];
}
