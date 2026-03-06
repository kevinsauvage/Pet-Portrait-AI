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
import { DEFAULT_CART_PAGINATION } from '@/domains/cart/utils/pagination';
import { cartDiscountCodesSchema } from '@/domains/cart/validation';

export const dynamic = 'force-dynamic';

export const PATCH = async (request: NextRequest) => {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
  }

  const handler = withApiHandler(
    {
      context: 'PATCH /api/cart/discount-codes',
      errorMessage: API_ERROR_MESSAGES.FAILED_TO_UPDATE_DISCOUNT_CODES,
    },
    async () => {
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
      const { cart, userErrors, warnings } = response || {};

      const mappedUserErrors = mapShopifyUserErrors(userErrors);
      if (mappedUserErrors) {
        return createErrorResponse(API_ERROR_MESSAGES.FAILED_TO_UPDATE_DISCOUNT_CODES, {
          userErrors: mappedUserErrors,
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (!cart) {
        return createErrorResponse(API_ERROR_MESSAGES.FAILED_TO_UPDATE_DISCOUNT_CODES, {
          message: 'Cart update did not return a valid cart',
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
      }

      CartService.revalidate();
      return createSuccessResponse(
        { ...cart, warnings: warnings || [] },
        { message: 'Discount codes updated successfully' },
      );
    },
  );

  return handler();
};
