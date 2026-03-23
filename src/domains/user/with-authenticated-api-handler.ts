import type { NextRequest } from 'next/server';

import {
  type WithApiHandlerBaseOptions,
  withResolvedApiHandler,
} from '@/core/utils/api-responses';
import { requireUserIdOrUnauthorized } from '@/domains/user/require-user-for-api';

/**
 * Requires a logged-in user id, then runs the handler via {@link withResolvedApiHandler}.
 */
export function withAuthenticatedApiHandler(
  options: WithApiHandlerBaseOptions,
  handler: (userId: string, request: NextRequest) => Promise<Response>,
) {
  return withResolvedApiHandler(options, requireUserIdOrUnauthorized, handler);
}
