import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  withApiHandler,
} from '@/core/utils/api-responses';
import { getPredictiveSearch } from '@/domains/search/services/search.service';

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
    const query = request.nextUrl.searchParams.get('q');

    const response = await getPredictiveSearch(query || '');
    if (!response) {
      return createSuccessResponse({ predictiveSearch: null });
    }

    return createSuccessResponse(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  },
);
