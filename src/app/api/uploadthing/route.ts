import { type NextRequest } from 'next/server';

import { HTTP_STATUS } from '@/core/utils/api-responses';
import { enforceRequestSizeLimit } from '@/core/utils/request-size';
import {
  ensureUploadAuth,
  isUploadThingServerHookRequest,
  uploadthingHandler,
} from '@/infra/upload/route-handler';

export async function GET(request: NextRequest) {
  const authError = await ensureUploadAuth(request);
  if (authError) return authError;
  return uploadthingHandler.GET(request);
}

export async function POST(request: NextRequest) {
  const sizeError = enforceRequestSizeLimit(request, {
    scope: 'upload',
    status: HTTP_STATUS.BAD_REQUEST,
    message: 'Upload request exceeds 64MB limit.',
  });
  if (sizeError) return sizeError;

  // Callback/error hooks are POSTed by UploadThing (or dev forwarder); auth is HMAC in the SDK.
  if (!isUploadThingServerHookRequest(request)) {
    const authError = await ensureUploadAuth(request);
    if (authError) return authError;
  }
  return uploadthingHandler.POST(request);
}
