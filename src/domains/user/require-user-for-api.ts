import type { NextResponse } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  type ApiErrorResponse,
  createErrorResponse,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { getUser } from '@/domains/user/get-user';

export async function requireUserIdOrUnauthorized(): Promise<
  string | NextResponse<ApiErrorResponse>
> {
  const user = await getUser();
  if (user?.id) return user.id;
  return createErrorResponse(API_ERROR_MESSAGES.USER_NOT_AUTHENTICATED, {
    status: HTTP_STATUS.UNAUTHORIZED,
  });
}
