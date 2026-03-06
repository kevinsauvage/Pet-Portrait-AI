import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  withApiHandler,
} from '@/core/utils/api-responses';
import { CartService } from '@/domains/cart/services/cart.service';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(
  {
    context: 'GET /api/cart',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_FETCH_CART,
  },
  async () => {
    const cartId = await CartService.getCartId();
    if (!cartId) {
      return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
    }

    const cart = await CartService.getCart(cartId);
    if (!cart) {
      // Cart doesn't exist (legitimate null response)
      return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
    }

    return createSuccessResponse(cart);
  },
);
