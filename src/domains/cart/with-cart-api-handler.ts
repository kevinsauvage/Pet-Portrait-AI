import type { NextRequest } from 'next/server';

import {
  type WithApiHandlerBaseOptions,
  withResolvedApiHandler,
} from '@/core/utils/api-responses';
import { resolveCartIdOrNotFound } from '@/domains/cart/resolve-cart-id-for-api';

/**
 * Resolves the session cart id, then runs the handler via {@link withResolvedApiHandler}.
 */
export function withCartApiHandler(
  options: WithApiHandlerBaseOptions,
  handler: (cartId: string, request: NextRequest) => Promise<Response>,
) {
  return withResolvedApiHandler(options, resolveCartIdOrNotFound, handler);
}
