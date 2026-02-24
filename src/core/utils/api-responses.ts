import { NextResponse } from 'next/server';

import type { CartUserError, CustomerUserError, UserError } from '@/infra/shopify/storefront';

import * as Sentry from '@sentry/nextjs';

export type ApiErrorResponse = {
  error: string;
  message?: string;
  userErrors?: Array<UserError | CartUserError | CustomerUserError>;
  code?: string;
};

export type ApiSuccessResponse<T = unknown> = {
  data: T;
  message?: string;
  success?: boolean;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/[a-zA-Z0-9]{32,}/g, '[REDACTED]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/password[=:]\s*[^\s]+/gi, 'password=[REDACTED]')
    .replace(/(api[_-]?key|access[_-]?token|secret)[=:]\s*[^\s]+/gi, '$1=[REDACTED]');
}

export function safeLogError(context: string, error: unknown): void {
  const errorMessage =
    error instanceof Error
      ? sanitizeErrorMessage(error.message)
      : typeof error === 'string'
        ? sanitizeErrorMessage(error)
        : 'Unknown error';

  console.error(`[${context}]`, errorMessage);

  if (error instanceof Error && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, { tags: { context } });
  }
}

export function createErrorResponse(
  error: string,
  options: {
    message?: string;
    userErrors?: Array<UserError | CartUserError | CustomerUserError>;
    code?: string;
    status?: number;
  } = {},
): NextResponse<ApiErrorResponse> {
  const { message, userErrors, code, status = HTTP_STATUS.INTERNAL_SERVER_ERROR } = options;

  const errorResponse: ApiErrorResponse = {
    error,
    ...(message && { message }),
    ...(userErrors && userErrors.length > 0 && { userErrors }),
    ...(code && { code }),
  };

  return NextResponse.json(errorResponse, { status });
}

export function createSuccessResponse<T>(
  data: T,
  options: {
    message?: string;
    status?: number;
    headers?: HeadersInit;
    noCache?: boolean;
  } = {},
): NextResponse<ApiSuccessResponse<T>> {
  const { message, status = HTTP_STATUS.OK, headers, noCache } = options;

  const successResponse: ApiSuccessResponse<T> = {
    data,
    ...(message && { message }),
    success: true,
  };

  return NextResponse.json(successResponse, {
    status,
    headers: noCache ? { ...NO_CACHE_HEADERS, ...headers } : headers,
  });
}

export function mapShopifyUserErrors(
  userErrors?: Array<UserError | CartUserError | CustomerUserError> | null,
): Array<UserError | CartUserError | CustomerUserError> | undefined {
  if (!userErrors?.length) return undefined;

  return userErrors.map((err) => ({
    ...err,
    message: err.message || 'An error occurred',
  }));
}

const ERROR_STATUS_MAP: Array<[RegExp, number]> = [
  [/\b(not found|Not Found)\b/i, HTTP_STATUS.NOT_FOUND],
  [/\b(unauthorized|Unauthorized|not authenticated)\b/i, HTTP_STATUS.UNAUTHORIZED],
  [/\b(forbidden|Forbidden)\b/i, HTTP_STATUS.FORBIDDEN],
  [/\b(validation|invalid)\b/i, HTTP_STATUS.BAD_REQUEST],
];

export function getErrorStatus(
  error: unknown,
  defaultStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
): number {
  if (!(error instanceof Error)) return defaultStatus;

  const message = error.message.toLowerCase();
  for (const [pattern, status] of ERROR_STATUS_MAP) {
    if (pattern.test(message)) return status;
  }

  return defaultStatus;
}

export function handleApiError(context: string, error: unknown, defaultMessage: string) {
  safeLogError(context, error);
  const status = getErrorStatus(error);
  return createErrorResponse(defaultMessage, {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    status,
  });
}
