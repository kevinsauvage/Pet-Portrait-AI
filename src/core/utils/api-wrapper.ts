import type { NextRequest } from 'next/server';

import { runWithRequestContextAsync } from './request-context';
import { getClientContext } from './request-identity';

/**
 * Wraps an API route handler with request context tracking
 * This ensures all logs within the handler include the request ID
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   return withRequestContext(request, async () => {
 *     // Your handler code
 *     // All logs will automatically include request ID
 *   });
 * }
 * ```
 */
export function withRequestContext<T>(request: NextRequest, handler: () => Promise<T>): Promise<T> {
  const { pathname } = request.nextUrl;
  const { ip } = getClientContext(request.headers);

  return runWithRequestContextAsync(
    {
      path: pathname,
      method: request.method,
      ip,
    },
    handler,
  );
}
