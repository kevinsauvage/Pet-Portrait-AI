import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  parseJsonBody,
  withApiHandler,
} from '@/core/utils/api-responses';
import { requireApiProtection } from '@/core/utils/auth';
import { createPerformanceLogger, logger } from '@/core/utils/logger.server';
import { enforceBodySizeLimit, enforceRequestSizeLimit } from '@/core/utils/request-size';
import { formatZodErrorMessage } from '@/core/utils/zod';
import { parsePortraitGenerationRequest } from '@/domains/ai/ai-portrait/request';
import { validateImageFromUrl } from '@/domains/ai/ai-portrait/validate-image';
import { generatePetPortraitVariations } from '@/domains/ai/portrait-generation.service';
import { getShopConfig } from '@/domains/shop/get-shop-config.service';
import { shopRateLimitExceededResponse } from '@/infra/rate-limit/rate-limit-api-response';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export const POST = withApiHandler(
  {
    context: 'POST /api/ai/generate',
    errorMessage: API_ERROR_MESSAGES.AI_PORTRAIT_GENERATION_FAILED,
  },
  async (request: NextRequest) => {
    const perf = createPerformanceLogger('ai.generate', 2000);
    const perfMeta: Record<string, unknown> = { success: false };

    try {
      const sizeError = enforceRequestSizeLimit(request, {
        scope: 'ai',
        status: 413,
        message: 'Request body must be smaller than 256KB.',
      });
      if (sizeError) return sizeError;

      const shopConfig = await getShopConfig();
      const rateLimitResponse = await shopRateLimitExceededResponse(
        request.headers,
        shopConfig,
        'ai',
      );
      if (rateLimitResponse) return rateLimitResponse;

      const authError = await requireApiProtection(request, {
        secretEnv: 'AI_API_SECRET',
        scope: 'ai',
      });
      if (authError) return authError;

      const body = await parseJsonBody(request);

      const bodySizeError = enforceBodySizeLimit(body, {
        scope: 'ai',
        status: 413,
        message: 'Request body must be smaller than 256KB.',
      });
      if (bodySizeError) return bodySizeError;
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
      perfMeta.styleId = styleId;
      perfMeta.success = true;
      return createSuccessResponse(result);
    } finally {
      perf.end(perfMeta);
    }
  },
);
