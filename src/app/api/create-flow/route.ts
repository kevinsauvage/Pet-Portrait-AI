import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import {
  clearCreateFlowUrl,
  getCreateFlowUrl,
  setCreateFlowUrl,
} from '@/domains/create-flow/services/create-flow.service';
import { getUser } from '@/domains/user/get-user';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = await getCreateFlowUrl();
    return createSuccessResponse({ url });
  } catch (error) {
    return handleApiError('GET /api/create-flow', error, 'Failed to get create flow');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return createErrorResponse('User not authenticated', {
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const body = await request.json();
    const url = typeof body?.url === 'string' ? body.url : '';

    const result = await setCreateFlowUrl(user.id, url);

    if (!result.success) {
      return createErrorResponse(result.message ?? 'Failed to save create flow', {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    return createSuccessResponse({ success: true }, { noCache: true });
  } catch (error) {
    return handleApiError('POST /api/create-flow', error, 'Failed to save create flow');
  }
}

export async function DELETE() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return createErrorResponse('User not authenticated', {
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const result = await clearCreateFlowUrl(user.id);

    if (!result.success) {
      return createErrorResponse(result.message ?? 'Failed to clear create flow', {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    return createSuccessResponse({ success: true }, { noCache: true });
  } catch (error) {
    return handleApiError('DELETE /api/create-flow', error, 'Failed to clear create flow');
  }
}
