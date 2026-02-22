import { NextResponse } from 'next/server';

import { isAdminAuthConfigured, isAdminAuthorized } from '@/core/utils/admin-auth';
import { createErrorResponse, HTTP_STATUS } from '@/core/utils/api-responses';
import { getFailedGenerations, getGenerationLogs } from '@/domains/ai/generation-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

  const logs = getGenerationLogs();
  const failed = getFailedGenerations();
  return NextResponse.json({
    data: logs,
    failedCount: failed.length,
    totalCount: logs.length,
  });
}
