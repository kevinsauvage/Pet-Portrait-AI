import type { NextResponse } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  type ApiErrorResponse,
  createErrorResponse,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { CartService } from '@/domains/cart/cart.service';

export async function resolveCartIdOrNotFound(): Promise<
  string | NextResponse<ApiErrorResponse>
> {
  const cartId = await CartService.getCartId();
  if (cartId) return cartId;
  return createErrorResponse(API_ERROR_MESSAGES.CART_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
}
