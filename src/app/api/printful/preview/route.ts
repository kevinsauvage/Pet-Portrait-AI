import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  parseJsonBody,
  withApiHandler,
} from '@/core/utils/api-responses';
import { requireApiProtection } from '@/core/utils/auth';
import { getClientContext } from '@/core/utils/request-identity';
import { generatePreview } from '@/domains/printful/preview.service';
import { printfulPreviewRequestSchema } from '@/domains/printful/validation';
import { getShopConfig } from '@/domains/shop/get-shop-config.service';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const POST = withApiHandler(
  {
    context: 'POST /api/printful/preview',
    errorMessage: 'Failed to generate product preview',
  },
  async (request: NextRequest) => {
    const { identifier } = getClientContext(request.headers);
    const shopConfig = await getShopConfig();
    const rateLimit = await checkRateLimit(identifier, {
      prefix: 'printful',
      maxRequests: shopConfig.rateLimit.printful.maxRequests,
      windowMs: shopConfig.rateLimit.printful.windowMs,
    });
    if (!rateLimit.allowed) {
      return createErrorResponse('Too many preview requests. Please try again later.', {
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        message: `Retry after ${rateLimit.retryAfter} seconds`,
      });
    }

    const authError = await requireApiProtection(request, {
      secretEnv: 'PRINTFUL_API_SECRET',
      scope: 'printful',
    });
    if (authError) return authError;

    const body = await parseJsonBody(request);
    const parsed = printfulPreviewRequestSchema.safeParse(body);

    if (!parsed.success) {
      return createErrorResponse('Invalid request body', {
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
