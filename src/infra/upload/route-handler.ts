import { type NextRequest } from 'next/server';

import { createErrorResponse, HTTP_STATUS } from '@/core/utils/api-responses';
import { requireApiProtection } from '@/core/utils/auth';
import { getClientContext } from '@/core/utils/request-identity';
import { getShopConfig } from '@/domains/shop/get-shop-config.service';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';
import { ourFileRouter } from '@/infra/upload/core';

import { createRouteHandler } from 'uploadthing/next';

/** Server-to-server webhook from UploadThing (signed with API key); no browser session. */
export function isUploadThingServerHookRequest(request: NextRequest): boolean {
  const hook = request.headers.get('uploadthing-hook')?.toLowerCase();
  return hook === 'callback' || hook === 'error';
}

export const uploadthingHandler = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },
});

export async function ensureUploadAuth(request: NextRequest) {
  const { identifier } = getClientContext(request.headers);
  const shopConfig = await getShopConfig();
  const rateLimit = await checkRateLimit(identifier, {
    prefix: 'upload',
    maxRequests: shopConfig.rateLimit.upload.maxRequests,
    windowMs: shopConfig.rateLimit.upload.windowMs,
  });
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
