import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { CartService } from '@/domains/cart/services/cart.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cartId = await CartService.getCartId();
    if (!cartId) {
      return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
    }

    const cart = await CartService.getCart(cartId);
    if (!cart) {
      throw new Error(API_ERROR_MESSAGES.FAILED_TO_FETCH_CART);
    }

    return createSuccessResponse(cart);
  } catch (error) {
    return handleApiError('GET /api/cart', error, API_ERROR_MESSAGES.FAILED_TO_FETCH_CART);
  }
}
