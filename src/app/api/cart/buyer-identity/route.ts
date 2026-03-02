import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
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
    return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const body = await request.json();
    const parsedBody = cartBuyerIdentitySchema.safeParse(body);
    if (!parsedBody.success) {
      return createErrorResponse(API_ERROR_MESSAGES.INVALID_REQUEST_BODY, {
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
      return createErrorResponse(API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART_BUYER_IDENTITY, {
        userErrors: mappedUserErrors,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    if (!cart) {
      return createErrorResponse(API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART_BUYER_IDENTITY, {
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
      API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART_BUYER_IDENTITY,
    );
  }
}
