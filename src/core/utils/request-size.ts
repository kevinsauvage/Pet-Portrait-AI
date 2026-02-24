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

export function getRequestSizeLimit(scope: RequestSizeScope): number {
  return REQUEST_SIZE_LIMITS[scope];
}

