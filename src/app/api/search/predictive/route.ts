import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  withApiHandler,
} from '@/core/utils/api-responses';
import { getClientContext } from '@/core/utils/request-identity';
import { getPredictiveSearch } from '@/domains/search/search.service';
import { getShopConfig } from '@/domains/shop/get-shop-config.service';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';

/** Private cache only; caps browser max-age to limit abuse amplification via shared edge caches. */
function predictiveSearchCacheControl(cacheRevalidateSearchSeconds: number): string {
  const maxAge = Math.min(cacheRevalidateSearchSeconds, 120);
  const swr = Math.min(maxAge * 4, 600);
  return `private, max-age=${maxAge}, stale-while-revalidate=${swr}`;
}

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(
  {
    context: 'GET /api/search/predictive',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_FETCH_PREDICTIVE_SEARCH,
    onError: (error) => {
      if (
        error instanceof Error &&
        (error.message.includes('rate limit') ||
          error.message.includes('429') ||
          error.message.includes('Too Many Requests'))
      ) {
        return createErrorResponse(API_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, {
          message: 'Rate limit exceeded. Please try again in a moment.',
          status: HTTP_STATUS.TOO_MANY_REQUESTS,
        });
      }

      return undefined;
    },
  },
  async (request: NextRequest) => {
    const { identifier } = getClientContext(request.headers);
    const shopConfig = await getShopConfig();
    const rateLimit = await checkRateLimit(identifier, {
      prefix: 'search',
      maxRequests: shopConfig.rateLimit.search.maxRequests,
      windowMs: shopConfig.rateLimit.search.windowMs,
    });
    if (!rateLimit.allowed) {
      return createErrorResponse(API_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, {
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        message: `Retry after ${rateLimit.retryAfter} seconds`,
      });
    }

    const query = request.nextUrl.searchParams.get('q');
    const response = await getPredictiveSearch(query ?? '');
    const cacheHeaders = {
      'Cache-Control': predictiveSearchCacheControl(shopConfig.cache.revalidate.search),
    };

    if (!response) {
      return createSuccessResponse({ predictiveSearch: null }, { headers: cacheHeaders });
    }

    return createSuccessResponse(response, { headers: cacheHeaders });
  },
);
