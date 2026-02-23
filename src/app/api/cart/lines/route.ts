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
import { getCartPaginationParams } from '@/domains/cart/utils/pagination';
import {
  cartLinesOperationSchema,
  resolveCartLineOperation,
} from '@/domains/cart/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse('Cart not found', { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const body = await request.json();
    const parsedBody = cartLinesOperationSchema.safeParse(body);
    if (!parsedBody.success) {
      return createErrorResponse('Invalid request body', {
        message: formatZodErrorMessage(parsedBody.error),
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    let resolvedOperation;
    try {
      resolvedOperation = resolveCartLineOperation(parsedBody.data);
    } catch (error) {
      return createErrorResponse('Invalid request body', {
        message: error instanceof Error ? error.message : 'Invalid cart line operation',
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    let cart;
    let userErrors;

    if (resolvedOperation.operation === 'add' && resolvedOperation.addLines) {
      const response = await CartService.addLines(
        cartId,
        resolvedOperation.addLines,
        getCartPaginationParams(request.nextUrl.searchParams),
      );

      cart = response?.cart;
      userErrors = response?.userErrors;
    } else if (resolvedOperation.lines) {
      const response = await CartService.updateLines(
        cartId,
        resolvedOperation.lines,
        getCartPaginationParams(request.nextUrl.searchParams),
      );

      cart = response?.cart;
      userErrors = response?.userErrors;
    }

    const mappedUserErrors = mapShopifyUserErrors(userErrors);
    if (mappedUserErrors) {
      const errorMsg =
        resolvedOperation.operation === 'add' ? 'Failed to add product' : 'Failed to update cart';
      return createErrorResponse(errorMsg, {
        userErrors: mappedUserErrors,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    if (!cart) {
      const errorMsg =
        resolvedOperation.operation === 'add' ? 'Failed to add product' : 'Failed to update cart';
      return createErrorResponse(errorMsg, {
        message: 'Cart operation did not return a valid cart',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    CartService.revalidate();
    const successMsg =
      resolvedOperation.operation === 'add'
        ? 'Product added successfully'
        : 'Cart updated successfully';
    return createSuccessResponse(cart, { message: successMsg, noCache: true });
  } catch (error) {
    return handleApiError('PATCH /api/cart/lines', error, 'Failed to update cart lines');
  }
}

export async function DELETE(request: NextRequest) {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse('Cart not found', { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const { searchParams } = request.nextUrl;
    const lineItemId = searchParams.get('lineItemId');
    if (!lineItemId) {
      return createErrorResponse('Missing line item ID', { status: HTTP_STATUS.BAD_REQUEST });
    }

    const response = await CartService.removeLines(
      cartId,
      [lineItemId],
      getCartPaginationParams(searchParams),
    );

    const { cart, userErrors } = response || {};

    const mappedUserErrors = mapShopifyUserErrors(userErrors);
    if (mappedUserErrors) {
      return createErrorResponse('Failed to remove product', {
        userErrors: mappedUserErrors,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    if (!cart) {
      return createErrorResponse('Failed to remove product', {
        message: 'Cart operation did not return a valid cart',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    CartService.revalidate();
    return createSuccessResponse(cart, { message: 'Product removed successfully' });
  } catch (error) {
    return handleApiError('DELETE /api/cart/lines', error, 'Failed to remove cart line');
  }
}
