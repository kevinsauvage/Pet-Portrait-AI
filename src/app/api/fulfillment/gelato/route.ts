import { type NextRequest } from 'next/server';

import { GELATO_PRODUCT_UIDS } from '@/modules/ai/ai-portrait/products';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/utils/api-responses';

export const dynamic = 'force-dynamic';

const GELATO_API_URL = 'https://order.gelatoapis.com/v4/orders';
const {GELATO_API_KEY} = process.env;

function getProperty(
  properties: Array<{ name: string; value: string }> | undefined,
  name: string,
): string | undefined {
  return properties?.find((p) => p.name === name)?.value;
}

export async function POST(request: NextRequest) {
  if (!GELATO_API_KEY) {
    return createErrorResponse('Gelato API not configured', {
      status: HTTP_STATUS.SERVICE_UNAVAILABLE,
    });
  }

  try {
    const body = await request.json();
    const { orderId, lineItems, shippingAddress } = body as {
      orderId: string;
      lineItems: Array<{
        id: number;
        properties?: Array<{ name: string; value: string }>;
      }>;
      shippingAddress?: {
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

    if (!orderId || !lineItems?.length || !shippingAddress) {
      return createErrorResponse('Missing required fields', {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const orderReferenceId = `shopify-${orderId}`;
    const customerReferenceId = `shopify-order-${orderId}`;

    const gelatoItems = lineItems.map((item, index) => {
      const artworkUrl = getProperty(item.properties, 'final_artwork_url');
      if (!artworkUrl) {
        throw new Error(`Line item ${item.id} missing artwork URL`);
      }

      const productType = getProperty(item.properties, 'product_type');
      const productUid =
        productType === 'canvas'
          ? GELATO_PRODUCT_UIDS.canvas
          : GELATO_PRODUCT_UIDS.poster;

      return {
        itemReferenceId: `item-${item.id}-${index}`,
        productUid,
        quantity: 1,
        files: [
          {
            url: artworkUrl,
            type: 'default',
          },
        ],
      };
    });

    const gelatoOrder = {
      orderReferenceId,
      customerReferenceId,
      shippingAddress: {
        firstName: shippingAddress.first_name,
        lastName: shippingAddress.last_name,
        addressLine1: shippingAddress.address1,
        addressLine2: shippingAddress.address2 ?? '',
        city: shippingAddress.city,
        state: shippingAddress.province,
        postCode: shippingAddress.zip,
        country: shippingAddress.country,
      },
      items: gelatoItems,
    };

    const response = await fetch(GELATO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': GELATO_API_KEY,
      },
      body: JSON.stringify(gelatoOrder),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gelato API error:', response.status, errText);
      return createErrorResponse(`Gelato order failed: ${errText}`, {
        status: HTTP_STATUS.BAD_GATEWAY,
      });
    }

    const result = await response.json();
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(
      'POST /api/fulfillment/gelato',
      error,
      'Gelato fulfillment failed',
    );
  }
}
