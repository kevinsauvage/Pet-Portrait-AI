import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
  mapShopifyUserErrors,
} from '@/core/utils/api-responses';
import { CartService } from '@/domains/cart/services/cart.service';
import { storefrontSdk } from '@/infra/shopify/client';

export const dynamic = 'force-dynamic';

const ERROR_MESSAGE = 'Failed to update discount codes';

export async function PATCH(request: NextRequest) {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse('Cart not found', { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const body = await request.json();
    const { discountCodes } = body as { discountCodes: string[] };

    if (!Array.isArray(discountCodes)) {
      return createErrorResponse('Invalid discount codes format', {
        message: 'Discount codes must be an array',
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const updateDiscountCodesResponse = await storefrontSdk('no-store').cartDiscountCodesUpdate({
      cartId,
      discountCodes,
      first: 100,
    });

    const { cart, userErrors, warnings } =
      updateDiscountCodesResponse?.cartDiscountCodesUpdate || {};

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
