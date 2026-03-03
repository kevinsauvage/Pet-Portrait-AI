import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { requireApiProtection } from '@/core/utils/auth';
import { createPerformanceLogger, logger } from '@/core/utils/logger';
import { getClientContext } from '@/core/utils/request-identity';
import { enforceRequestSizeLimit } from '@/core/utils/request-size';
import { formatZodErrorMessage } from '@/core/utils/zod';
import { parsePortraitGenerationRequest } from '@/domains/ai/ai-portrait/request';
import { validateImageFromUrl } from '@/domains/ai/ai-portrait/validate-image';
import { generatePetPortraitVariations } from '@/domains/ai/services';
import { getShopConfig } from '@/domains/shop/services';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max (safe upper bound)

export async function POST(request: NextRequest) {
  const perf = createPerformanceLogger('ai.generate', 2000); // Log if > 2s

  try {
    const sizeError = enforceRequestSizeLimit(request, {
      scope: 'ai',
      status: 413,
      message: 'Request body must be smaller than 256KB.',
    });
    if (sizeError) return sizeError;

    const { identifier } = getClientContext(request.headers);
    const shopConfig = await getShopConfig();
    const rateLimit = await checkRateLimit(identifier, {
      prefix: 'ai',
      maxRequests: shopConfig.rateLimit.ai.maxRequests,
      windowMs: shopConfig.rateLimit.ai.windowMs,
    });
    if (!rateLimit.allowed) {
      return createErrorResponse(API_ERROR_MESSAGES.TOO_MANY_REQUESTS, {
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
      return createErrorResponse(API_ERROR_MESSAGES.INVALID_REQUEST_BODY, {
        message: formatZodErrorMessage(parsedBody.error),
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const { originalPhotoUrl, styleId } = parsedBody.data;

    logger.info('Starting AI portrait generation', {
      context: 'ai.generate',
      metadata: { styleId },
    });

    const validation = await validateImageFromUrl(originalPhotoUrl);
    if (!validation.valid) {
      logger.warn('Image validation failed', {
        context: 'ai.generate',
        metadata: { originalPhotoUrl: '[REDACTED]' },
      });
      return createErrorResponse(validation.error ?? 'Invalid image', {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const result = await generatePetPortraitVariations(originalPhotoUrl, styleId);
    perf.end({ styleId, success: true });
    return createSuccessResponse(result);
  } catch (error) {
    perf.end({ success: false });
    return handleApiError(
      'POST /api/ai/generate',
      error,
      API_ERROR_MESSAGES.AI_PORTRAIT_GENERATION_FAILED,
    );
  }
}
