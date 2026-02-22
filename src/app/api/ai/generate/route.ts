import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { generatePetPortraitVariations } from '@/domains/ai/actions';
import { type ArtStyleId, isValidStyleId, validStyleIdsLabel } from '@/domains/ai/ai-portrait/types';
import { validateImageFromUrl } from '@/domains/ai/ai-portrait/validate-image';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'anonymous';
}

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier);
    if (!rateLimit.allowed) {
      return createErrorResponse('Too many requests. Please try again later.', {
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        message: `Retry after ${rateLimit.retryAfter} seconds`,
      });
    }

    const body = await request.json();
    const { originalPhotoUrl, styleId } = body as {
      originalPhotoUrl?: string;
      styleId?: string;
    };

    if (!originalPhotoUrl || typeof originalPhotoUrl !== 'string') {
      return createErrorResponse('originalPhotoUrl is required', {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    if (!isValidStyleId(styleId)) {
      return createErrorResponse(
        `styleId must be one of: ${validStyleIdsLabel()}`,
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    const validation = await validateImageFromUrl(originalPhotoUrl);
    if (!validation.valid) {
      return createErrorResponse(validation.error ?? 'Invalid image', {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const result = await generatePetPortraitVariations(originalPhotoUrl, styleId as ArtStyleId);
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError('POST /api/ai/generate', error, 'AI portrait generation failed');
  }
}
