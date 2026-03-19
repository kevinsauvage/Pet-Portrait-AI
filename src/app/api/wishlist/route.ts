import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  parseJsonBody,
  parseZodBody,
  withApiHandler,
} from '@/core/utils/api-responses';
import { getUser } from '@/domains/user/get-user';
import { wishlistAddSchema } from '@/domains/wishlist/validation';
import { WishlistService } from '@/domains/wishlist/wishlist.service';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(
  {
    context: 'GET /api/wishlist',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_FETCH_WISHLIST,
  },
  async () => {
    const wishlist = await WishlistService.getWishlist();
    return createSuccessResponse(wishlist);
  },
);

export const POST = withApiHandler(
  {
    context: 'POST /api/wishlist',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_ADD_PRODUCT_TO_WISHLIST,
  },
  async (request: NextRequest) => {
    await WishlistService.requireAuth();
    const user = await getUser();

    if (!user?.id) {
      return createErrorResponse(API_ERROR_MESSAGES.USER_NOT_FOUND, {
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    const body = await parseJsonBody(request);
    const parsedBody = parseZodBody(body, wishlistAddSchema, {
      errorMessage: API_ERROR_MESSAGES.INVALID_REQUEST_BODY,
      status: HTTP_STATUS.BAD_REQUEST,
    });

    if (!parsedBody.success) {
      return parsedBody.response;
    }

    const result = await WishlistService.addPortrait(parsedBody.data, user.id);

    if (!result.success) {
      const status =
        result.reason === 'duplicate' || result.reason === 'max'
          ? HTTP_STATUS.BAD_REQUEST
          : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      return createErrorResponse(API_ERROR_MESSAGES.FAILED_TO_ADD_PRODUCT_TO_WISHLIST, {
        message: result.message,
        status,
      });
    }

    return createSuccessResponse(result.data, {
      message: result.message,
      noCache: true,
    });
  },
);
