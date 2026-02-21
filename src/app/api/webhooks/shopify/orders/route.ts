import { type NextRequest } from 'next/server';

import { createErrorResponse, createSuccessResponse, HTTP_STATUS } from '@/utils/api-responses';

import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

const {SHOPIFY_WEBHOOK_SECRET} = process.env;

function verifyShopifyWebhook(body: string, hmacHeader: string | null): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET || !hmacHeader) return false;

  const hash = createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmacHeader;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const hmac = request.headers.get('x-shopify-hmac-sha256');

    if (!verifyShopifyWebhook(body, hmac)) {
      return createErrorResponse('Invalid webhook signature', {
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const order = JSON.parse(body) as {
      id: number;
      line_items?: Array<{
        id: number;
        title: string;
        properties?: Array<{ name: string; value: string }>;
      }>;
      shipping_address?: {
        first_name: string;
        last_name: string;
        address1: string;
        address2?: string;
        city: string;
        province: string;
        country: string;
        zip: string;
      };
    };

    const podItems = order.line_items?.filter((item) => {
      const props = item.properties ?? [];
      const hasArtwork = props.some(
        (p) => p.name === 'final_artwork_url' && p.value,
      );
      const productType = props.find((p) => p.name === 'product_type')?.value;
      if (!hasArtwork) return false;
      if (productType === 'digital') return false;
      return (
        productType === 'canvas' ||
        productType === 'poster' ||
        !productType
      );
    });

    if (!podItems?.length) {
      return createSuccessResponse({ received: true, podOrders: 0 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/fulfillment/gelato`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: String(order.id),
        lineItems: podItems,
        shippingAddress: order.shipping_address,
      }),
    });

    if (!response.ok) {
      console.error('Gelato fulfillment failed:', await response.text());
    }

    return createSuccessResponse({ received: true, podOrders: podItems.length });
  } catch (error) {
    console.error('Shopify orders webhook error:', error);
    return createErrorResponse('Webhook processing failed', {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}
