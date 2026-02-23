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
import { DEFAULT_CART_PAGINATION } from '@/domains/cart/utils/pagination';
import { cartDiscountCodesSchema } from '@/domains/cart/validation';

export const dynamic = 'force-dynamic';

const ERROR_MESSAGE = 'Failed to update discount codes';

export async function PATCH(request: NextRequest) {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse('Cart not found', { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const body = await request.json();
    const parsedBody = cartDiscountCodesSchema.safeParse(body);
    if (!parsedBody.success) {
      return createErrorResponse('Invalid discount codes format', {
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
      return createErrorResponse(ERROR_MESSAGE, {
        userErrors: mappedUserErrors,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    if (!cart) {
      return createErrorResponse(ERROR_MESSAGE, {
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
    return handleApiError('PATCH /api/cart/discount-codes', error, ERROR_MESSAGE);
  }
}
