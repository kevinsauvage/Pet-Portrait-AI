import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import { requireAdminAuth } from '@/core/utils/admin-auth';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { formatZodErrorMessage } from '@/core/utils/zod';
import { parsePortraitGenerationRequest } from '@/domains/ai/ai-portrait/request';
import { generatePetPortraitVariations } from '@/domains/ai/services';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max (safe upper bound)

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request.headers);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsedBody = parsePortraitGenerationRequest(body);
    if (!parsedBody.success) {
      return createErrorResponse(API_ERROR_MESSAGES.INVALID_REQUEST_BODY, {
        message: formatZodErrorMessage(parsedBody.error),
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const result = await generatePetPortraitVariations(
      parsedBody.data.originalPhotoUrl,
      parsedBody.data.styleId,
    );
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError('POST /api/admin/regenerate', error, 'Regeneration failed');
  }
}
