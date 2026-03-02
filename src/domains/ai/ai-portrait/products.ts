export interface AiPortraitProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  currencyCode: string;
  availableForSale: boolean;
}

export interface AiPortraitProduct {
  shopifyProductId: string;
  handle: string;
  title: string;
  description: string;
  image?: string;
  gelatoProductUid?: string;
  variants: AiPortraitProductVariant[];
}
