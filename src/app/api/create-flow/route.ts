import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
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
import { withAuthenticatedApiHandler } from '@/domains/user/with-authenticated-api-handler';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(
  {
    context: 'GET /api/create-flow',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_GET_CREATE_FLOW,
  },
  async () => {
    const url = await getCreateFlowUrl();
    return createSuccessResponse({ url });
  },
);

export const POST = withAuthenticatedApiHandler(
  {
    context: 'POST /api/create-flow',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_SAVE_CREATE_FLOW,
  },
  async (userId, request) => {
    const body = await parseJsonBody<{ url?: string }>(request);
    const url = typeof body?.url === 'string' ? body.url : '';

    const result = await setCreateFlowUrl(userId, url);

    if (!result.success) {
      return createErrorResponse(result.message ?? API_ERROR_MESSAGES.FAILED_TO_SAVE_CREATE_FLOW, {
        status: result.invalidInput ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    return createSuccessResponse({ success: true }, { noCache: true });
  },
);

export const DELETE = withAuthenticatedApiHandler(
  {
    context: 'DELETE /api/create-flow',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_CLEAR_CREATE_FLOW,
  },
  async (userId, _request) => {
    const result = await clearCreateFlowUrl(userId);

    if (!result.success) {
      return createErrorResponse(result.message ?? API_ERROR_MESSAGES.FAILED_TO_CLEAR_CREATE_FLOW, {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    return createSuccessResponse({ success: true }, { noCache: true });
  },
);
