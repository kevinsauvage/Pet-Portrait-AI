import { NextResponse } from 'next/server';

import { requireAdminAuth } from '@/core/utils/admin-auth';
import { getFailedGenerations, getGenerationLogs } from '@/domains/ai/generation-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authError = requireAdminAuth(request.headers);
  if (authError) return authError;

  const logs = getGenerationLogs();
  const failed = getFailedGenerations();
  return NextResponse.json({
    data: logs,
    failedCount: failed.length,
    totalCount: logs.length,
  });
}
