import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
  mapShopifyUserErrors,
} from '@/core/utils/api-responses';
import { CartService } from '@/domains/cart/services/cart.service';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGINATION = {
  first: 100,
  last: 0,
  after: '',
  before: '',
};

function getPaginationParams(searchParams: URLSearchParams) {
  const int = (key: string, fallback: number) => {
    const val = searchParams.get(key);
    return val ? Number.parseInt(val, 10) : fallback;
  };
  return {
    first: int('first', DEFAULT_PAGINATION.first),
    last: int('last', DEFAULT_PAGINATION.last),
    after: searchParams.get('after') || DEFAULT_PAGINATION.after,
    before: searchParams.get('before') || DEFAULT_PAGINATION.before,
  };
}

export async function PATCH(request: NextRequest) {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse('Cart not found', { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const body = await request.json();
    const { lines, operation = 'update' } = body as {
      lines?: Array<{ id: string; quantity: number }>;
      addLines?: Array<{
        merchandiseId: string;
        quantity?: number;
        attributes?: Array<{ key: string; value: string }>;
      }>;
      operation?: 'update' | 'add';
    };

    if (!lines && !body.addLines) {
      return createErrorResponse('Invalid request body', {
        message: 'Request body must include either lines or addLines',
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    let cart;
    let userErrors;

    if (operation === 'add' && body.addLines) {
      const response = await CartService.addLines(
        cartId,
        body.addLines,
        getPaginationParams(request.nextUrl.searchParams),
      );

      cart = response?.cart;
      userErrors = response?.userErrors;
    } else if (lines) {
      const response = await CartService.updateLines(
        cartId,
        lines,
        getPaginationParams(request.nextUrl.searchParams),
      );

      cart = response?.cart;
      userErrors = response?.userErrors;
    }

    const mappedUserErrors = mapShopifyUserErrors(userErrors);
    if (mappedUserErrors) {
      const errorMsg = operation === 'add' ? 'Failed to add product' : 'Failed to update cart';
      return createErrorResponse(errorMsg, {
        userErrors: mappedUserErrors,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    if (!cart) {
      const errorMsg = operation === 'add' ? 'Failed to add product' : 'Failed to update cart';
      return createErrorResponse(errorMsg, {
        message: 'Cart operation did not return a valid cart',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    CartService.revalidate();
    const successMsg =
      operation === 'add' ? 'Product added successfully' : 'Cart updated successfully';
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
      getPaginationParams(searchParams),
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
