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
import { DEFAULT_CART_PAGINATION } from '@/domains/cart/utils/pagination';
import { cartDiscountCodesSchema } from '@/domains/cart/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const body = await request.json();
    const parsedBody = cartDiscountCodesSchema.safeParse(body);
    if (!parsedBody.success) {
      return createErrorResponse(API_ERROR_MESSAGES.INVALID_DISCOUNT_CODES_FORMAT, {
        message: formatZodErrorMessage(parsedBody.error),
        status: HTTP_STATUS.BAD_REQUEST,
      });
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
  } catch (error) {
    return handleApiError(
      'PATCH /api/cart/discount-codes',
      error,
      API_ERROR_MESSAGES.FAILED_TO_UPDATE_DISCOUNT_CODES,
    );
  }
}
