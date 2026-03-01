import { withRetry } from '@/core/utils/retry';
import { findGelatoProductByShopifyId, type GelatoProduct } from '@/infra/gelato/client';

import type { ShopifyProductWebhookPayload } from './shopify-product-webhook.types';

export type GelatoIds = {
  gelatoProductId: string;
  gelatoVariantId: string | null;
};

/**
 * The Gelato Shopify app syncs products asynchronously after Shopify creates them.
 * We poll with exponential backoff to give the sync time to complete.
 * 5 attempts × doubling from 2 s → up to ~30 s total wait.
 */
const POLL_MAX_ATTEMPTS = 5;
const POLL_BASE_DELAY_MS = 2_000;
const POLL_MAX_DELAY_MS = 16_000;

function toGelatoIds(gelatoProduct: GelatoProduct): GelatoIds {
  const firstVariant =
    gelatoProduct.variants?.find((v) => v.externalId != null) ?? gelatoProduct.variants?.[0];
  return {
    gelatoProductId: gelatoProduct.id,
    gelatoVariantId: firstVariant?.id ?? null,
  };
}

export async function getGelatoIdsForShopifyProduct(
  shopifyProduct: ShopifyProductWebhookPayload,
): Promise<GelatoIds | null> {
  const storeId = process.env.GELATO_STORE_ID;
  if (!storeId || !process.env.GELATO_API_KEY) return null;

  const shopifyRestId = String(shopifyProduct.id);

  const gelatoProduct = await withRetry(
    () => findGelatoProductByShopifyId(storeId, shopifyRestId),
    {
      maxAttempts: POLL_MAX_ATTEMPTS,
      baseDelayMs: POLL_BASE_DELAY_MS,
      maxDelayMs: POLL_MAX_DELAY_MS,
      isSuccess: (result) => result != null,
    },
  );

  if (!gelatoProduct) return null;

  return toGelatoIds(gelatoProduct);
}
