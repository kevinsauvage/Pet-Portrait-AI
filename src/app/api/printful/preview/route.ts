import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  parseJsonBody,
  withApiHandler,
} from '@/core/utils/api-responses';
import { generatePreview } from '@/domains/printful/preview.service';
import { printfulPreviewRequestSchema } from '@/domains/printful/validation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const POST = withApiHandler(
  {
    context: 'POST /api/printful/preview',
    errorMessage: 'Failed to generate product preview',
  },
  async (request: Request) => {
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
