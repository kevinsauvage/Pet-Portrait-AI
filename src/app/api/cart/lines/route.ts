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
import { getCartPaginationParams } from '@/domains/cart/utils/pagination';
import {
  cartLinesOperationSchema,
  resolveCartLineOperation,
} from '@/domains/cart/validation';

export const dynamic = 'force-dynamic';

export const PATCH = async (request: NextRequest) => {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
  }

  const handler = withApiHandler(
    {
      context: 'PATCH /api/cart/lines',
      errorMessage: API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART_LINES,
    },
    async () => {
      const body = await parseJsonBody(request);
      const parsedBody = parseZodBody(body, cartLinesOperationSchema, {
        errorMessage: API_ERROR_MESSAGES.INVALID_REQUEST_BODY,
        status: HTTP_STATUS.BAD_REQUEST,
      });
      if (!parsedBody.success) {
        return parsedBody.response;
      }

      let resolvedOperation;
      try {
        resolvedOperation = resolveCartLineOperation(parsedBody.data);
      } catch (error) {
        return createErrorResponse(API_ERROR_MESSAGES.INVALID_REQUEST_BODY, {
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
          resolvedOperation.operation === 'add'
            ? API_ERROR_MESSAGES.FAILED_TO_ADD_PRODUCT
            : API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART;
        return createErrorResponse(errorMsg, {
          userErrors: mappedUserErrors,
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (!cart) {
        const errorMsg =
          resolvedOperation.operation === 'add'
            ? API_ERROR_MESSAGES.FAILED_TO_ADD_PRODUCT
            : API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART;
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
    },
  );

  return handler();
};

export const DELETE = async (request: NextRequest) => {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
  }

  const handler = withApiHandler(
    {
      context: 'DELETE /api/cart/lines',
      errorMessage: API_ERROR_MESSAGES.FAILED_TO_REMOVE_CART_LINE,
    },
    async () => {
      const { searchParams } = request.nextUrl;
      const lineItemId = searchParams.get('lineItemId');
      if (!lineItemId) {
        return createErrorResponse(API_ERROR_MESSAGES.MISSING_LINE_ITEM_ID, {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const response = await CartService.removeLines(
        cartId,
        [lineItemId],
        getCartPaginationParams(searchParams),
      );

      const { cart, userErrors } = response || {};

      const mappedUserErrors = mapShopifyUserErrors(userErrors);
      if (mappedUserErrors) {
        return createErrorResponse(API_ERROR_MESSAGES.FAILED_TO_REMOVE_PRODUCT, {
          userErrors: mappedUserErrors,
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (!cart) {
        return createErrorResponse(API_ERROR_MESSAGES.FAILED_TO_REMOVE_PRODUCT, {
          message: 'Cart operation did not return a valid cart',
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
      }

      CartService.revalidate();
      return createSuccessResponse(cart, { message: 'Product removed successfully' });
    },
  );

  return handler();
};
