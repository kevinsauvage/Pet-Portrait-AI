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
import { generatePreview } from '@/domains/printful/preview.service';
import { printfulPreviewRequestSchema } from '@/domains/printful/validation';
import { getShopConfig } from '@/domains/shop/get-shop-config.service';
import { shopRateLimitExceededResponse } from '@/infra/rate-limit/rate-limit-api-response';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const POST = withApiHandler(
  {
    context: 'POST /api/printful/preview',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_GENERATE_PRINTFUL_PREVIEW,
  },
  async (request: NextRequest) => {
    const shopConfig = await getShopConfig();
    const rateLimitResponse = await shopRateLimitExceededResponse(
      request.headers,
      shopConfig,
      'printful',
    );
    if (rateLimitResponse) return rateLimitResponse;

    const authError = await requireApiProtection(request, {
      secretEnv: 'PRINTFUL_API_SECRET',
      scope: 'printful',
    });
    if (authError) return authError;

    const body = await parseJsonBody(request);
    const parsed = printfulPreviewRequestSchema.safeParse(body);

    if (!parsed.success) {
      return createErrorResponse(API_ERROR_MESSAGES.INVALID_REQUEST_BODY, {
        status: HTTP_STATUS.BAD_REQUEST,
        message: parsed.error.issues.map((e) => e.message).join(', '),
      });
    }

    const { variantId, artworkUrl } = parsed.data;

    const result = await generatePreview({
      variantId,
      artworkUrl,
    });

    return createSuccessResponse(
      { previewUrl: result.previewUrl },
      { noCache: true },
    );
  },
);
