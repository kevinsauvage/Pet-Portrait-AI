import { type NextRequest } from 'next/server';

import { createErrorResponse, createSuccessResponse, HTTP_STATUS } from '@/core/utils/api-responses';
import {
  createGelatoFulfillmentOrder,
  getPrintableLineItems,
  type ShopifyLineItem,
  type ShopifyShippingAddress,
} from '@/domains/orders/services/gelato-fulfillment.service';
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

    const order = JSON.parse(body) as {
      id: number;
      line_items?: ShopifyLineItem[];
      shipping_address?: ShopifyShippingAddress;
    };

    const podItems = getPrintableLineItems(order.line_items ?? []);

    if (!podItems.length) {
      return createSuccessResponse({ received: true, podOrders: 0 });
    }

    if (!order.shipping_address) {
      console.error('Gelato fulfillment skipped: missing shipping address.');
      return createSuccessResponse({ received: true, podOrders: 0 });
    }

    try {
      const fulfillmentResult = await createGelatoFulfillmentOrder({
        orderId: String(order.id),
        lineItems: podItems,
        shippingAddress: order.shipping_address,
      });

      if (!fulfillmentResult.ok) {
        console.error(
          'Gelato fulfillment failed:',
          fulfillmentResult.status,
          fulfillmentResult.errorText,
        );
      }
    } catch (error) {
      console.error('Gelato fulfillment failed:', error);
    }

    return createSuccessResponse({ received: true, podOrders: podItems.length });
  } catch (error) {
    console.error('Shopify orders webhook error:', error);
    return createErrorResponse('Webhook processing failed', {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}
