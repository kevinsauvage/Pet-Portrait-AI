import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
  mapShopifyUserErrors,
} from '@/core/utils/api-responses';
import { formatZodErrorMessage } from '@/core/utils/zod';
import { CartService } from '@/domains/cart/services/cart.service';
import { buildBuyerIdentityInput } from '@/domains/cart/utils/buyer-identity';
import { cartBuyerIdentitySchema } from '@/domains/cart/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse('Cart not found', { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const body = await request.json();
    const parsedBody = cartBuyerIdentitySchema.safeParse(body);
    if (!parsedBody.success) {
      return createErrorResponse('Invalid request body', {
        message: formatZodErrorMessage(parsedBody.error),
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const { customerAccessToken, user, first, last, after, before } = parsedBody.data;
    const buyerIdentity = buildBuyerIdentityInput({ customerAccessToken, user });

    const response = await CartService.updateBuyerIdentity(cartId, buyerIdentity, {
      after: after || '',
      before: before || '',
      first: first || 0,
      last: last || 0,
    });

    const { cart, userErrors } = response || {};

    const mappedUserErrors = mapShopifyUserErrors(userErrors);
    if (mappedUserErrors) {
      return createErrorResponse('Failed to update cart buyer identity', {
        userErrors: mappedUserErrors,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    if (!cart) {
      return createErrorResponse('Failed to update cart buyer identity', {
        message: 'Cart update did not return a valid cart',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    CartService.revalidate();
    return createSuccessResponse(cart, { message: 'Cart buyer identity updated successfully' });
  } catch (error) {
    return handleApiError(
      'PATCH /api/cart/buyer-identity',
      error,
      'Failed to update cart buyer identity',
    );
  }
}
