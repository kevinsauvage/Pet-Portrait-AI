import { findGelatoProductByShopifyId } from '@/infra/gelato/client';

import type { ShopifyProductWebhookPayload } from './shopify-product-webhook.types';

export type GelatoIds = {
  gelatoProductId: string;
  gelatoVariantId: string | null;
};

export async function getGelatoIdsForShopifyProduct(
  shopifyProduct: ShopifyProductWebhookPayload,
): Promise<GelatoIds | null> {
  const storeId = process.env.GELATO_STORE_ID;
  if (!storeId || !process.env.GELATO_API_KEY) return null;

  const gelatoProduct = await findGelatoProductByShopifyId(storeId, String(shopifyProduct.id));
  if (!gelatoProduct) return null;

  const firstVariant =
    gelatoProduct.variants?.find((v) => v.externalId != null) ?? gelatoProduct.variants?.[0];

  return {
    gelatoProductId: gelatoProduct.id,
    gelatoVariantId: firstVariant?.id ?? null,
  };
}
