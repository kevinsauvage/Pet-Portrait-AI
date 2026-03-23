import type { NextResponse } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  type ApiErrorResponse,
  createErrorResponse,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { getClientContext } from '@/core/utils/request-identity';
import type { ShopConfig } from '@/domains/shop/shop-config.defaults';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';

export type RateLimitBucketConfig = {
  maxRequests: number;
  windowMs: number;
};

export async function rateLimitExceededResponse(
  headers: Headers,
  options: { prefix: string } & RateLimitBucketConfig,
): Promise<NextResponse<ApiErrorResponse> | null> {
  const { identifier } = getClientContext(headers);
  const rateLimit = await checkRateLimit(identifier, {
    prefix: options.prefix,
    maxRequests: options.maxRequests,
    windowMs: options.windowMs,
  });
  if (rateLimit.allowed) return null;
  return createErrorResponse(API_ERROR_MESSAGES.TOO_MANY_REQUESTS, {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: `Retry after ${rateLimit.retryAfter} seconds`,
  });
}

export type ShopRateLimitBucket = keyof ShopConfig['rateLimit'];

export async function shopRateLimitExceededResponse(
  headers: Headers,
  shopConfig: ShopConfig,
  bucket: ShopRateLimitBucket,
): Promise<NextResponse<ApiErrorResponse> | null> {
  const cfg = shopConfig.rateLimit[bucket];
  return rateLimitExceededResponse(headers, {
    prefix: bucket,
    maxRequests: cfg.maxRequests,
    windowMs: cfg.windowMs,
  });
}
