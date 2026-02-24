import { type NextRequest } from 'next/server';

import { isApiAuthConfigured, isApiAuthorized } from '@/core/utils/api-auth';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { logger } from '@/core/utils/logger';
import { formatZodErrorMessage } from '@/core/utils/zod';
import { createGelatoFulfillmentOrder } from '@/domains/orders/services/gelato-fulfillment.service';
import { gelatoFulfillmentRequestSchema } from '@/domains/orders/validation';

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
    const parsedBody = gelatoFulfillmentRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      return createErrorResponse('Missing required fields', {
        message: formatZodErrorMessage(parsedBody.error),
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const result = await createGelatoFulfillmentOrder(parsedBody.data);

    if (!result.ok) {
      logger.error('api.fulfillment.gelato', new Error(`${result.status}: ${result.errorText}`));
      return createErrorResponse(`Gelato order failed: ${result.errorText}`, {
        status: HTTP_STATUS.BAD_GATEWAY,
      });
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError('POST /api/fulfillment/gelato', error, 'Gelato fulfillment failed');
  }
}
