import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { logger } from '@/core/utils/logger';
import { getGelatoIdsForShopifyProduct } from '@/domains/products/services/get-gelato-ids-for-product';
import { setGelatoMetafieldsOnProduct } from '@/domains/products/services/shopify-product-gelato-metafields.service';
import {
  type ShopifyProductWebhookPayload,
  toProductGid,
  toVariantGid,
} from '@/domains/products/services/shopify-product-webhook.types';
import { verifyShopifyWebhook } from '@/infra/shopify/webhooks';

export const dynamic = 'force-dynamic';

const LOG = 'webhook.products';
const { SHOPIFY_WEBHOOK_SECRET } = process.env;

/**
 * Receives Shopify products/create webhooks.
 * Looks up the matching Gelato product and writes gelato.product_id / gelato.variant_id
 * as metafields on the Shopify product and first variant.
 * Returns 404 when no Gelato product is found for the incoming Shopify product.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const hmac = request.headers.get('x-shopify-hmac-sha256');

    if (!verifyShopifyWebhook(body, hmac, SHOPIFY_WEBHOOK_SECRET)) {
      return createErrorResponse('Invalid webhook signature', { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const product = JSON.parse(body) as ShopifyProductWebhookPayload;
    console.log('🚀 ~ POST ~ product:', JSON.parse(JSON.stringify(product)));
    const productGid = toProductGid(product.id, product.admin_graphql_api_id);
    const firstVariant = product.variants?.[0];
    const variantGid = firstVariant
      ? toVariantGid(firstVariant.id, firstVariant.admin_graphql_api_id)
      : undefined;

    const gelatoIds = await getGelatoIdsForShopifyProduct(product);

    if (!gelatoIds) {
      logger.warn(LOG, new Error(`No Gelato product found for Shopify product ${productGid}`));
      return createErrorResponse('Gelato product not found', { status: HTTP_STATUS.NOT_FOUND });
    }

    const result = await setGelatoMetafieldsOnProduct({
      shopifyProductGid: productGid,
      gelatoProductId: gelatoIds.gelatoProductId,
      shopifyVariantGid: variantGid,
      gelatoVariantId: gelatoIds.gelatoVariantId,
    });

    if (!result.success) {
      logger.warn(LOG, new Error(`Failed to set Gelato metafields for ${productGid}`));
      return createErrorResponse('Failed to set Gelato metafields', {
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      });
    }

    logger.info(LOG, {
      productGid,
      variantGid,
      gelatoProductId: gelatoIds.gelatoProductId,
      gelatoVariantId: gelatoIds.gelatoVariantId,
    });

    return createSuccessResponse({ received: true, productGid, metafieldsSet: true });
  } catch (error) {
    logger.error(LOG, error);
    return createErrorResponse('Webhook processing failed', {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}
