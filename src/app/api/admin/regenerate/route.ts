import { type NextRequest } from 'next/server';

import { generatePetPortraitVariations } from '@/actions/ai-portrait.actions';
import { type ArtStyleId, isValidStyleId, validStyleIdsLabel } from '@/modules/ai/ai-portrait/types';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/utils/api-responses';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
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
      return createErrorResponse(
        `styleId must be one of: ${validStyleIdsLabel()}`,
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    const result = await generatePetPortraitVariations(originalPhotoUrl, styleId as ArtStyleId);
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError('POST /api/admin/regenerate', error, 'Regeneration failed');
  }
}
