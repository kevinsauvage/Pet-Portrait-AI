import { type NextRequest } from 'next/server';

import { isApiAuthConfigured, isApiAuthorized } from '@/core/utils/api-auth';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import {
  createGelatoFulfillmentOrder,
  type GelatoFulfillmentRequest,
} from '@/domains/orders/services/gelato-fulfillment.service';

export const dynamic = 'force-dynamic';

const { GELATO_API_KEY } = process.env;

export async function POST(request: NextRequest) {
  if (!isApiAuthConfigured('FULFILLMENT_API_SECRET') && process.env.NODE_ENV === 'production') {
    return createErrorResponse('Fulfillment auth not configured', {
      status: HTTP_STATUS.SERVICE_UNAVAILABLE,
    });
  }

  if (
    isApiAuthConfigured('FULFILLMENT_API_SECRET') &&
    !isApiAuthorized(request.headers, 'FULFILLMENT_API_SECRET')
  ) {
    return createErrorResponse('Unauthorized', {
      status: HTTP_STATUS.UNAUTHORIZED,
    });
  }

  if (!GELATO_API_KEY) {
    return createErrorResponse('Gelato API not configured', {
      status: HTTP_STATUS.SERVICE_UNAVAILABLE,
    });
  }

  try {
    const body = await request.json();
    const { orderId, lineItems, shippingAddress } = body as GelatoFulfillmentRequest;

    if (!orderId || !lineItems?.length || !shippingAddress) {
      return createErrorResponse('Missing required fields', {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const result = await createGelatoFulfillmentOrder({
      orderId,
      lineItems,
      shippingAddress,
    });

    if (!result.ok) {
      console.error('Gelato API error:', result.status, result.errorText);
      return createErrorResponse(`Gelato order failed: ${result.errorText}`, {
        status: HTTP_STATUS.BAD_GATEWAY,
      });
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(
      'POST /api/fulfillment/gelato',
      error,
      'Gelato fulfillment failed',
    );
  }
}
