import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { getPredictiveSearch } from '@/domains/search/services/search.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  try {
    const response = await getPredictiveSearch(query || '');
    if (!response) {
      return createSuccessResponse({ predictiveSearch: null });
    }

    return createSuccessResponse(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('rate limit') ||
        error.message.includes('429') ||
        error.message.includes('Too Many Requests'))
    ) {
      return createErrorResponse('Rate limit exceeded', {
        message: 'Rate limit exceeded. Please try again in a moment.',
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
      });
    }

    return handleApiError('GET /api/search/predictive', error, 'Failed to fetch predictive search results');
  }
}
