import { type NextRequest } from 'next/server';

import { createErrorResponse, createSuccessResponse, HTTP_STATUS } from '@/core/utils/api-responses';
import {
  fulfillGelatoFromShopifyOrder,
  type ShopifyOrderWebhookPayload,
} from '@/domains/orders/services';
import { verifyShopifyWebhook } from '@/infra/shopify/webhooks';

export const dynamic = 'force-dynamic';

const { SHOPIFY_WEBHOOK_SECRET } = process.env;

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
    const fulfillment = await fulfillGelatoFromShopifyOrder(order);

    if (fulfillment.skippedReason === 'missing_shipping_address') {
      console.error('Gelato fulfillment skipped: missing shipping address.');
    }

    if (fulfillment.gelatoError) {
      console.error(
        'Gelato fulfillment failed:',
        fulfillment.gelatoError.status ?? 'unknown',
        fulfillment.gelatoError.message,
      );
    }

    return createSuccessResponse({ received: true, podOrders: fulfillment.podOrders });
  } catch (error) {
    console.error('Shopify orders webhook error:', error);
    return createErrorResponse('Webhook processing failed', {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}
