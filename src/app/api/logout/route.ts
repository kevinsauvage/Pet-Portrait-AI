import { type NextRequest } from 'next/server';

import config from '@/core/config';
import { createSuccessResponse, handleApiError, safeLogError } from '@/core/utils/api-responses';
import { storefrontSdk } from '@/infra/shopify/client';
import { clearShopifyToken, getShopifyToken } from '@/infra/shopify/server';
import { delCookieAction } from '@/lib/cookies/actions';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    const token = await getShopifyToken();
    if (token) {
      try {
        await storefrontSdk('no-store').customerAccessTokenDelete({
          customerAccessToken: token,
        });
      } catch (error) {
        safeLogError('POST /api/logout - token deletion', error);
      }
    }

    await clearShopifyToken();
    await delCookieAction(config.cookies.delegateToken);

    return createSuccessResponse({ success: 'Logged out successfully' });
  } catch (error) {
    return handleApiError('POST /api/logout', error, 'Failed to logout');
  }
}
