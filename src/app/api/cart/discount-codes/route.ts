import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createSuccessResponse,
  evaluateCartMutation,
  HTTP_STATUS,
  parseJsonBody,
  parseZodBody,
} from '@/core/utils/api-responses';
import { CartService } from '@/domains/cart/cart.service';
import { DEFAULT_CART_PAGINATION } from '@/domains/cart/cart-pagination';
import { cartDiscountCodesSchema } from '@/domains/cart/validation';
import { withCartApiHandler } from '@/domains/cart/with-cart-api-handler';

export const dynamic = 'force-dynamic';

export const PATCH = withCartApiHandler(
  {
    context: 'PATCH /api/cart/discount-codes',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_UPDATE_DISCOUNT_CODES,
  },
  async (cartId, request) => {
    const body = await parseJsonBody(request);
    const parsedBody = parseZodBody(body, cartDiscountCodesSchema, {
      errorMessage: API_ERROR_MESSAGES.INVALID_DISCOUNT_CODES_FORMAT,
      status: HTTP_STATUS.BAD_REQUEST,
    });
    if (!parsedBody.success) {
      return parsedBody.response;
    }

    const { discountCodes } = parsedBody.data;

    const response = await CartService.updateDiscountCodes(cartId, discountCodes, {
      first: DEFAULT_CART_PAGINATION.first,
    });
    const { warnings } = response || {};
    const outcome = evaluateCartMutation(
      response,
      API_ERROR_MESSAGES.FAILED_TO_UPDATE_DISCOUNT_CODES,
    );
    if (!outcome.ok) {
      return outcome.response;
    }

    CartService.revalidate();
    return createSuccessResponse(
      { ...outcome.cart, warnings: warnings || [] },
      { message: 'Discount codes updated successfully' },
    );
  },
);
