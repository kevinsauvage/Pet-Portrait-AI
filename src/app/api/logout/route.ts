import { type NextRequest } from 'next/server';

import { createSuccessResponse, handleApiError } from '@/core/utils/api-responses';
import { AuthService } from '@/domains/auth/services/auth.service';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    await AuthService.logout();
    return createSuccessResponse({ success: 'Logged out successfully' });
  } catch (error) {
    return handleApiError('POST /api/logout', error, 'Failed to logout');
  }
}
