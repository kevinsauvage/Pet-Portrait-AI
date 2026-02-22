import type { NextRequest } from 'next/server';

import { isApiAuthConfigured, isApiAuthorized } from '@/core/utils/api-auth';
import { createErrorResponse, HTTP_STATUS } from '@/core/utils/api-responses';
import { isApiSessionValid, isSameOriginRequest } from '@/core/utils/api-session';

type ProtectionScope = 'ai' | 'upload';
type ProtectionSecret = 'AI_API_SECRET' | 'UPLOADTHING_API_SECRET';

type ProtectionOptions = {
  secretEnv: ProtectionSecret;
  scope: ProtectionScope;
};

export async function requireApiProtection(
  request: NextRequest,
  { secretEnv, scope }: ProtectionOptions,
) {
  if (!isApiAuthConfigured(secretEnv)) return null;

  const headerAuthorized = isApiAuthorized(request.headers, secretEnv);
  if (headerAuthorized) return null;

  if (!isSameOriginRequest(request)) {
    return createErrorResponse('Forbidden', {
      status: HTTP_STATUS.FORBIDDEN,
    });
  }

  if (!(await isApiSessionValid(request, scope))) {
    return createErrorResponse('Unauthorized', {
      status: HTTP_STATUS.UNAUTHORIZED,
    });
  }

  return null;
}
