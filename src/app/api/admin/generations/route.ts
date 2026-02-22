import { NextResponse } from 'next/server';

import {
  getFailedGenerations,
  getGenerationLogs,
} from '@/domains/ai/generation-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const logs = getGenerationLogs();
  const failed = getFailedGenerations();
  return NextResponse.json({
    data: logs,
    failedCount: failed.length,
    totalCount: logs.length,
  });
}
