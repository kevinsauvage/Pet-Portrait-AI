import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  parseJsonBody,
  withApiHandler,
} from '@/core/utils/api-responses';
import { generatePreview } from '@/domains/printful/services/preview.service';

import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const previewRequestSchema = z.object({
  variantId: z.number().int().positive('variantId must be a positive integer'),
  artworkUrl: z.string().url('artworkUrl must be a valid URL'),
});

export const POST = withApiHandler(
  {
    context: 'POST /api/printful/preview',
    errorMessage: 'Failed to generate product preview',
  },
  async (request: Request) => {
    const body = await parseJsonBody(request);
    const parsed = previewRequestSchema.safeParse(body);

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
