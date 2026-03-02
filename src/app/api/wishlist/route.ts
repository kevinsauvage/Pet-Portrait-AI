import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { formatZodErrorMessage } from '@/core/utils/zod';
import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';
import { wishlistAddSchema } from '@/domains/wishlist/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const wishlist = await WishlistService.getWishlist();
    return createSuccessResponse(wishlist);
  } catch (error) {
    return handleApiError('GET /api/wishlist', error, API_ERROR_MESSAGES.FAILED_TO_FETCH_WISHLIST);
  }
}

export async function POST(request: NextRequest) {
  try {
    await WishlistService.requireAuth();
    const user = await getUser();

    if (!user?.id) {
      return createErrorResponse(API_ERROR_MESSAGES.USER_NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
    }

    const body = await request.json();
    const parsedBody = wishlistAddSchema.safeParse(body);
    if (!parsedBody.success) {
      return createErrorResponse(API_ERROR_MESSAGES.MISSING_OR_INVALID_PRODUCT_ID, {
        message: formatZodErrorMessage(parsedBody.error),
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const { productId } = parsedBody.data;

    const result = await WishlistService.addProductWithValidation(productId, user.id);

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

    const wishlist = await WishlistService.getWishlist();
    return createSuccessResponse(wishlist, {
      message: result.message,
      noCache: true,
    });
  } catch (error) {
    return handleApiError('POST /api/wishlist', error, API_ERROR_MESSAGES.FAILED_TO_ADD_PRODUCT_TO_WISHLIST);
  }
}
