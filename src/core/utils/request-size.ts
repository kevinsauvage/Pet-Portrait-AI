import { type NextRequest } from 'next/server';

import { createErrorResponse } from '@/core/utils/api-responses';

type RequestSizeScope = 'ai' | 'upload';

const REQUEST_SIZE_LIMITS: Record<RequestSizeScope, number> = {
  ai: 256 * 1024,
  upload: 64 * 1024 * 1024,
} as const;

type RequestSizeOptions = {
  scope: RequestSizeScope;
  status?: number;
  message?: string;
};

/**
 * Enforces request size limits by checking Content-Length header.
 *
 * **Limitations:**
 * - Content-Length header can be spoofed or omitted by malicious clients
 * - For JSON requests, actual body size should be verified after parsing
 * - For streaming uploads, UploadThing enforces its own file size limits
 *
 * @param request - Next.js request object
 * @param options - Size limit options
 * @returns Error response if limit exceeded, null otherwise
 */
export function enforceRequestSizeLimit(
  request: NextRequest,
  { scope, status, message }: RequestSizeOptions,
) {
  const contentLength = request.headers.get('content-length');
  if (!contentLength) return null;

  const size = Number.parseInt(contentLength, 10);
  if (Number.isNaN(size)) return null;

  const maxBytes = REQUEST_SIZE_LIMITS[scope];
  if (size <= maxBytes) return null;

  return createErrorResponse('Payload too large', {
    status: status ?? 413,
    message: message ?? `Request body exceeds limit for ${scope} requests.`,
  });
}

/**
 * Validates actual body size for JSON requests.
 * This provides a more reliable check than Content-Length header alone.
 *
 * @param body - Parsed JSON body (as object or string)
 * @param scope - Size limit scope
 * @returns Error response if limit exceeded, null otherwise
 */
export function enforceBodySizeLimit(
  body: unknown,
  { scope, status, message }: RequestSizeOptions,
) {
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  const actualSize = new TextEncoder().encode(bodyString).length;
  const maxBytes = REQUEST_SIZE_LIMITS[scope];

  if (actualSize <= maxBytes) return null;

  return createErrorResponse('Payload too large', {
    status: status ?? 413,
    message: message ?? `Request body exceeds limit for ${scope} requests.`,
  });
}

export function getRequestSizeLimit(scope: RequestSizeScope): number {
  return REQUEST_SIZE_LIMITS[scope];
}

