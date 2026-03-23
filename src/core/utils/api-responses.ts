import { type NextRequest, NextResponse } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import { logger } from '@/core/utils/logger';
import { formatZodErrorMessage } from '@/core/utils/zod';
import type {
  CartUserError,
  CustomerUserError,
  UserError,
} from '@/infra/shopify/generated/storefront/index';

import type { ZodError, ZodSchema } from 'zod';

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

type CartMutationPayload<TCart> = {
  cart?: TCart | null;
  userErrors?: Array<UserError | CartUserError | CustomerUserError> | null;
};

/**
 * Normalizes Shopify cart mutations: userErrors → 400, missing cart → 500, otherwise the cart payload.
 */
export function evaluateCartMutation<TCart>(
  result: CartMutationPayload<TCart> | null | undefined,
  error: string,
  options?: { detailMessage?: string },
): { ok: true; cart: TCart } | { ok: false; response: NextResponse<ApiErrorResponse> } {
  const { cart, userErrors } = result ?? {};
  const mappedUserErrors = mapShopifyUserErrors(userErrors);
  if (mappedUserErrors) {
    return {
      ok: false,
      response: createErrorResponse(error, {
        userErrors: mappedUserErrors,
        status: HTTP_STATUS.BAD_REQUEST,
      }),
    };
  }

  if (cart == null) {
    return {
      ok: false,
      response: createErrorResponse(error, {
        message: options?.detailMessage ?? API_ERROR_MESSAGES.CART_MUTATION_INCOMPLETE,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }),
    };
  }

  return { ok: true, cart };
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
  logger.error('API error occurred', {
    context,
    error,
    metadata: { defaultMessage },
  });
  const status = getErrorStatus(error);
  return createErrorResponse(defaultMessage, {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    status,
  });
}

type ApiHandler<TArgs extends unknown[]> = (...args: TArgs) => Promise<Response> | Response;

export type WithApiHandlerBaseOptions = {
  context: string;
  errorMessage: string;
};

export function withApiHandler<TArgs extends unknown[]>(
  options: WithApiHandlerBaseOptions & {
    onError?: (error: unknown) => Response | undefined;
  },
  handler: ApiHandler<TArgs>,
) {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      const customResponse = options.onError?.(error);
      if (customResponse) return customResponse;
      return handleApiError(options.context, error, options.errorMessage);
    }
  };
}

/**
 * Resolves a prerequisite (e.g. cart id, user id); on failure returns that response.
 * Otherwise runs the handler inside {@link withApiHandler}.
 */
export function withResolvedApiHandler(
  options: WithApiHandlerBaseOptions,
  resolve: () => Promise<string | NextResponse<ApiErrorResponse>>,
  handler: (resolved: string, request: NextRequest) => Promise<Response>,
) {
  return async (request: NextRequest) => {
    const resolved = await resolve();
    if (typeof resolved !== 'string') return resolved;
    return withApiHandler(options, () => handler(resolved, request))();
  };
}

export type ParsedZodBody<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse<ApiErrorResponse> };

export function parseZodBody<T>(
  data: unknown,
  schema: ZodSchema<T>,
  options: {
    errorMessage: string;
    status?: number;
    formatError?: (error: ZodError) => string;
  },
): ParsedZodBody<T> {
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const message = options.formatError
    ? options.formatError(parsed.error)
    : formatZodErrorMessage(parsed.error);

  return {
    success: false,
    response: createErrorResponse(options.errorMessage, {
      message,
      status: options.status ?? HTTP_STATUS.BAD_REQUEST,
    }),
  };
}

export async function parseJsonBody<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch (error) {
    const parseError = new Error('Invalid JSON body');
    (parseError as Error & { cause?: unknown }).cause = error;
    throw parseError;
  }
}
