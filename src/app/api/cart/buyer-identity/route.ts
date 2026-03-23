import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createSuccessResponse,
  evaluateCartMutation,
  HTTP_STATUS,
  parseJsonBody,
  parseZodBody,
} from '@/core/utils/api-responses';
import { CartService } from '@/domains/cart/cart.service';
import { buildBuyerIdentityInput } from '@/domains/cart/cart-buyer-identity';
import { cartBuyerIdentitySchema } from '@/domains/cart/validation';
import { withCartApiHandler } from '@/domains/cart/with-cart-api-handler';

export const dynamic = 'force-dynamic';

export const PATCH = withCartApiHandler(
  {
    context: 'PATCH /api/cart/buyer-identity',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART_BUYER_IDENTITY,
  },
  async (cartId, request) => {
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

    const outcome = evaluateCartMutation(
      response,
      API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART_BUYER_IDENTITY,
    );
    if (!outcome.ok) {
      return outcome.response;
    }

    CartService.revalidate();
    return createSuccessResponse(outcome.cart, {
      message: 'Cart buyer identity updated successfully',
    });
  },
);
