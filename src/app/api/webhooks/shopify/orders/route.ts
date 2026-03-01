import { type NextRequest } from 'next/server';

import { createErrorResponse, createSuccessResponse, HTTP_STATUS } from '@/core/utils/api-responses';
import { logger } from '@/core/utils/logger';
import {
  inspectShopifyOrder,
  type ShopifyOrderWebhookPayload,
} from '@/domains/orders/services';
import { verifyShopifyWebhook } from '@/infra/shopify/webhooks';

export const dynamic = 'force-dynamic';

const { SHOPIFY_WEBHOOK_SECRET } = process.env;

/**
 * Receives Shopify order/created webhooks for logging and analytics.
 * Gelato fulfillment is handled automatically by the Gelato Shopify app —
 * no direct Gelato API call is made here.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const hmac = request.headers.get('x-shopify-hmac-sha256');

    if (!verifyShopifyWebhook(body, hmac, SHOPIFY_WEBHOOK_SECRET)) {
      return createErrorResponse('Invalid webhook signature', {
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const order = JSON.parse(body) as ShopifyOrderWebhookPayload;
    const inspection = inspectShopifyOrder(order);

    if (inspection.missingArtworkItems > 0) {
      logger.warn(
        'webhook.orders',
        new Error(
          `Order ${inspection.orderId}: ${inspection.missingArtworkItems} line item(s) missing Custom Artwork URL`,
        ),
      );
    }

    logger.info('webhook.orders', {
      orderId: inspection.orderId,
      physicalPodItems: inspection.physicalPodItems,
      skippedDigitalItems: inspection.skippedDigitalItems,
      missingArtworkItems: inspection.missingArtworkItems,
    });

    return createSuccessResponse({
      received: true,
      physicalPodItems: inspection.physicalPodItems,
    });
  } catch (error) {
    logger.error('webhook.orders', error);
    return createErrorResponse('Webhook processing failed', {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}
