import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  evaluateCartMutation,
  HTTP_STATUS,
  parseJsonBody,
  parseZodBody,
} from '@/core/utils/api-responses';
import { CartService } from '@/domains/cart/cart.service';
import { getCartPaginationParams } from '@/domains/cart/cart-pagination';
import {
  cartLinesOperationSchema,
  resolveCartLineOperation,
} from '@/domains/cart/validation';
import { withCartApiHandler } from '@/domains/cart/with-cart-api-handler';

export const dynamic = 'force-dynamic';

export const PATCH = withCartApiHandler(
  {
    context: 'PATCH /api/cart/lines',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART_LINES,
  },
  async (cartId, request) => {
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

    const pagination = getCartPaginationParams(request.nextUrl.searchParams);
    const mutationErrorKey =
      resolvedOperation.operation === 'add'
        ? API_ERROR_MESSAGES.FAILED_TO_ADD_PRODUCT
        : API_ERROR_MESSAGES.FAILED_TO_UPDATE_CART;

    let shopifyResponse;
    if (resolvedOperation.operation === 'add' && resolvedOperation.addLines) {
      shopifyResponse = await CartService.addLines(
        cartId,
        resolvedOperation.addLines,
        pagination,
      );
    } else if (resolvedOperation.lines) {
      shopifyResponse = await CartService.updateLines(
        cartId,
        resolvedOperation.lines,
        pagination,
      );
    }

    const outcome = evaluateCartMutation(shopifyResponse, mutationErrorKey);
    if (!outcome.ok) {
      return outcome.response;
    }

    CartService.revalidate();
    const successMsg =
      resolvedOperation.operation === 'add'
        ? 'Product added successfully'
        : 'Cart updated successfully';
    return createSuccessResponse(outcome.cart, { message: successMsg, noCache: true });
  },
);

export const DELETE = withCartApiHandler(
  {
    context: 'DELETE /api/cart/lines',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_REMOVE_CART_LINE,
  },
  async (cartId, request) => {
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

    const outcome = evaluateCartMutation(response, API_ERROR_MESSAGES.FAILED_TO_REMOVE_PRODUCT);
    if (!outcome.ok) {
      return outcome.response;
    }

    CartService.revalidate();
    return createSuccessResponse(outcome.cart, { message: 'Product removed successfully' });
  },
);
