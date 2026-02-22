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
import { adjustPaginationVariables } from '@/infra/shopify/helpers';
import type { CartBuyerIdentityInput, GetCustomerQuery } from '@/infra/shopify/storefront';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  const cartId = await CartService.getCartId();

  if (!cartId) {
    return createErrorResponse('Cart not found', { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const body = await request.json();
    const { customerAccessToken, user, first, last, after, before } = body as {
      customerAccessToken: string;
      user: GetCustomerQuery['customer'];
      first?: number;
      last?: number;
      after?: string;
      before?: string;
    };

    if (!customerAccessToken) {
      return createErrorResponse('Missing customerAccessToken', {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    if (!user) {
      return createErrorResponse('Missing user', { status: HTTP_STATUS.BAD_REQUEST });
    }

    const buyerIdentity = {
      customerAccessToken,
      email: user.email,
      phone: user.phone,
    } as CartBuyerIdentityInput;

    const updateResponse = await storefrontSdk('no-store').cartBuyerIdentityUpdate({
      buyerIdentity,
      cartId,
      ...adjustPaginationVariables({
        after: after || '',
        before: before || '',
        first: first || 0,
        last: last || 0,
      }),
    });

    const { cart, userErrors } = updateResponse?.cartBuyerIdentityUpdate || {};

    const mappedUserErrors = mapShopifyUserErrors(userErrors);
    if (mappedUserErrors) {
      return createErrorResponse('Failed to update cart buyer identity', {
        userErrors: mappedUserErrors,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    if (!cart) {
      return createErrorResponse('Failed to update cart buyer identity', {
        message: 'Cart update did not return a valid cart',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    CartService.revalidate();
    return createSuccessResponse(cart, { message: 'Cart buyer identity updated successfully' });
  } catch (error) {
    return handleApiError(
      'PATCH /api/cart/buyer-identity',
      error,
      'Failed to update cart buyer identity',
    );
  }
}
