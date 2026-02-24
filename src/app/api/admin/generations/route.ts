import { NextResponse } from 'next/server';

import { requireAdminAuth } from '@/core/utils/admin-auth';
import { handleApiError } from '@/core/utils/api-responses';
import { getAdminGenerationSnapshot } from '@/domains/ai/services/admin-dashboard.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authError = requireAdminAuth(request.headers);
  if (authError) return authError;

  try {
    const snapshot = getAdminGenerationSnapshot();
    // Preserve existing API contract: { data, failedCount, totalCount }
    return NextResponse.json({
      data: snapshot.logs,
      failedCount: snapshot.failedCount,
      totalCount: snapshot.totalCount,
    });
  } catch (error) {
    return handleApiError('GET /api/admin/generations', error, 'Failed to fetch admin generations');
  }
}
