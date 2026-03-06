import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import { createSuccessResponse, withApiHandler } from '@/core/utils/api-responses';
import { AuthService } from '@/domains/auth/services/auth.service';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(
  { context: 'POST /api/logout', errorMessage: API_ERROR_MESSAGES.FAILED_TO_LOGOUT },
  async (_request: NextRequest) => {
    await AuthService.logout();
    return createSuccessResponse({ success: 'Logged out successfully' });
  },
);
