import { type NextRequest } from 'next/server';

import { requireApiProtection } from '@/core/utils/api-protection';
import { createErrorResponse, HTTP_STATUS } from '@/core/utils/api-responses';
import { getClientContext } from '@/core/utils/request-identity';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';
import { ourFileRouter } from '@/infra/upload/core';

import { createRouteHandler } from 'uploadthing/next';

const handler = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },
});

async function ensureUploadAuth(request: NextRequest) {
  const {identifier} = getClientContext(request.headers);
  const rateLimit = checkRateLimit(identifier, { prefix: 'upload', maxRequests: 12 });
  if (!rateLimit.allowed) {
    return createErrorResponse('Too many upload requests. Please try again later.', {
      status: HTTP_STATUS.TOO_MANY_REQUESTS,
      message: `Retry after ${rateLimit.retryAfter} seconds`,
    });
  }

  const authError = await requireApiProtection(request, {
    secretEnv: 'UPLOADTHING_API_SECRET',
    scope: 'upload',
  });
  if (authError) return authError;

  return null;
}

export async function GET(request: NextRequest) {
  const authError = await ensureUploadAuth(request);
  if (authError) return authError;
  return handler.GET(request);
}

export async function POST(request: NextRequest) {
  const authError = await ensureUploadAuth(request);
  if (authError) return authError;
  return handler.POST(request);
}
