import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  mapShopifyUserErrors,
  parseJsonBody,
  parseZodBody,
  withApiHandler,
} from '@/core/utils/api-responses';
import { CartService } from '@/domains/cart/services/cart.service';
import { buildBuyerIdentityInput } from '@/domains/cart/utils/buyer-identity';
import { cartBuyerIdentitySchema } from '@/domains/cart/validation';

export const dynamic = 'force-dynamic';

export const PATCH = async (request: NextRequest) => {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
  }

  const handler = withApiHandler(
    {
      context: 'PATCH /api/cart/buyer-identity',
      errorMessage: API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART_BUYER_IDENTITY,
    },
    async () => {
      const body = await parseJsonBody(request);
      const parsedBody = parseZodBody(body, cartBuyerIdentitySchema, {
        errorMessage: API_ERROR_MESSAGES.INVALID_REQUEST_BODY,
        status: HTTP_STATUS.BAD_REQUEST,
      });
      if (!parsedBody.success) {
        return parsedBody.response;
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
    },
  );

  return handler();
};
