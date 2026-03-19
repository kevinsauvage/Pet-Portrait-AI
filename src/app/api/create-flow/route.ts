import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  parseJsonBody,
  withApiHandler,
} from '@/core/utils/api-responses';
import {
  clearCreateFlowUrl,
  getCreateFlowUrl,
  setCreateFlowUrl,
} from '@/domains/create-flow/create-flow.service';
import { getUser } from '@/domains/user/get-user';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(
  { context: 'GET /api/create-flow', errorMessage: 'Failed to get create flow' },
  async () => {
    const url = await getCreateFlowUrl();
    return createSuccessResponse({ url });
  },
);

export const POST = withApiHandler(
  { context: 'POST /api/create-flow', errorMessage: 'Failed to save create flow' },
  async (request: NextRequest) => {
    const user = await getUser();
    if (!user?.id) {
      return createErrorResponse('User not authenticated', {
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const body = await parseJsonBody<{ url?: string }>(request);
    const url = typeof body?.url === 'string' ? body.url : '';

    const result = await setCreateFlowUrl(user.id, url);

    if (!result.success) {
      return createErrorResponse(result.message ?? 'Failed to save create flow', {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    return createSuccessResponse({ success: true }, { noCache: true });
  },
);

export const DELETE = withApiHandler(
  { context: 'DELETE /api/create-flow', errorMessage: 'Failed to clear create flow' },
  async () => {
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
  },
);
