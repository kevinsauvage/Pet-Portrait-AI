import { type NextRequest } from 'next/server';

import { ensureUploadAuth, uploadthingHandler } from '@/infra/upload/route-handler';

export async function GET(request: NextRequest) {
  const authError = await ensureUploadAuth(request);
  if (authError) return authError;
  return uploadthingHandler.GET(request);
}

export async function POST(request: NextRequest) {
  const authError = await ensureUploadAuth(request);
  if (authError) return authError;
  return uploadthingHandler.POST(request);
}
