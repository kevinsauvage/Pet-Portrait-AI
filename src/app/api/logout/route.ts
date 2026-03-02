import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import { createSuccessResponse, handleApiError } from '@/core/utils/api-responses';
import { AuthService } from '@/domains/auth/services/auth.service';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    await AuthService.logout();
    return createSuccessResponse({ success: 'Logged out successfully' });
  } catch (error) {
    return handleApiError('POST /api/logout', error, API_ERROR_MESSAGES.FAILED_TO_LOGOUT);
  }
}
