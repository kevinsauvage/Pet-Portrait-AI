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
      return createErrorResponse('Cart not found', { status: HTTP_STATUS.NOT_FOUND });
    }

    const cart = await CartService.getCart(cartId);
    if (!cart) {
      throw new Error('Failed to fetch cart');
    }

    return createSuccessResponse(cart);
  } catch (error) {
    return handleApiError('GET /api/cart', error, 'Failed to fetch cart');
  }
}
