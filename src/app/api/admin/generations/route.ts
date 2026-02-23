import { NextResponse } from 'next/server';

import { requireAdminAuth } from '@/core/utils/admin-auth';
import { getAdminGenerationSnapshot } from '@/domains/ai/services/admin-dashboard.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authError = requireAdminAuth(request.headers);
  if (authError) return authError;

  const snapshot = getAdminGenerationSnapshot();
  return NextResponse.json({
    data: snapshot.logs,
    failedCount: snapshot.failedCount,
    totalCount: snapshot.totalCount,
  });
}
