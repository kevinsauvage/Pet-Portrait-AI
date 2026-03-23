import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { CartService } from '@/domains/cart/cart.service';
import { withCartApiHandler } from '@/domains/cart/with-cart-api-handler';

export const dynamic = 'force-dynamic';

export const GET = withCartApiHandler(
  {
    context: 'GET /api/cart',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_FETCH_CART,
  },
  async (cartId, _request: NextRequest) => {
    const cart = await CartService.getCart(cartId);
    if (!cart) {
      // Cart doesn't exist (legitimate null response)
      return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
    }

    return createSuccessResponse(cart);
  },
);
