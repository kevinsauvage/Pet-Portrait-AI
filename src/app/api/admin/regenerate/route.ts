import { type NextRequest } from 'next/server';

import { isAdminAuthConfigured, isAdminAuthorized } from '@/core/utils/admin-auth';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { generatePetPortraitVariations } from '@/domains/ai/actions';
import {
  type ArtStyleId,
  isValidStyleId,
  validStyleIdsLabel,
} from '@/domains/ai/ai-portrait/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured() && process.env.NODE_ENV === 'production') {
    return createErrorResponse('Admin auth not configured', {
      status: HTTP_STATUS.SERVICE_UNAVAILABLE,
    });
  }

  if (!isAdminAuthorized(request.headers)) {
    return createErrorResponse('Unauthorized', {
      status: HTTP_STATUS.UNAUTHORIZED,
    });
  }

  try {
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
      return createErrorResponse(`styleId must be one of: ${validStyleIdsLabel()}`, {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const result = await generatePetPortraitVariations(originalPhotoUrl, styleId as ArtStyleId);
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError('POST /api/admin/regenerate', error, 'Regeneration failed');
  }
}
