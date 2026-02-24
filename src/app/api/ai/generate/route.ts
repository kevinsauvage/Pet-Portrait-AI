import { type NextRequest } from 'next/server';

import { requireApiProtection } from '@/core/utils/api-protection';
import { createErrorResponse, createSuccessResponse, handleApiError, HTTP_STATUS } from '@/core/utils/api-responses';
import { getClientContext } from '@/core/utils/request-identity';
import { enforceRequestSizeLimit } from '@/core/utils/request-size';
import { formatZodErrorMessage } from '@/core/utils/zod';
import { generatePetPortraitVariations } from '@/domains/ai/actions';
import { parsePortraitGenerationRequest } from '@/domains/ai/ai-portrait/request';
import { validateImageFromUrl } from '@/domains/ai/ai-portrait/validate-image';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const sizeError = enforceRequestSizeLimit(request, {
      scope: 'ai',
      status: 413,
      message: 'Request body must be smaller than 256KB.',
    });
    if (sizeError) return sizeError;

    const { identifier } = getClientContext(request.headers);
    const rateLimit = await checkRateLimit(identifier, { prefix: 'ai' });
    if (!rateLimit.allowed) {
      return createErrorResponse('Too many requests. Please try again later.', {
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        message: `Retry after ${rateLimit.retryAfter} seconds`,
      });
    }

    const authError = await requireApiProtection(request, {
      secretEnv: 'AI_API_SECRET',
      scope: 'ai',
    });
    if (authError) return authError;

    const body = await request.json();
    const parsedBody = parsePortraitGenerationRequest(body);
    if (!parsedBody.success) {
      return createErrorResponse('Invalid request body', {
        message: formatZodErrorMessage(parsedBody.error),
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const { originalPhotoUrl, styleId } = parsedBody.data;

    const validation = await validateImageFromUrl(originalPhotoUrl);
    if (!validation.valid) {
      return createErrorResponse(validation.error ?? 'Invalid image', {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const result = await generatePetPortraitVariations(originalPhotoUrl, styleId);
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError('POST /api/ai/generate', error, 'AI portrait generation failed');
  }
}
