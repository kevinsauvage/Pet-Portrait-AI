import { type NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';
import {
  createErrorResponse,
  createSuccessResponse,
  HTTP_STATUS,
  withApiHandler,
} from '@/core/utils/api-responses';
import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';

export const dynamic = 'force-dynamic';

export const DELETE = withApiHandler(
  {
    context: 'DELETE /api/wishlist/[productId]',
    errorMessage: API_ERROR_MESSAGES.FAILED_TO_REMOVE_PRODUCT_FROM_WISHLIST,
  },
  async (request: NextRequest, { params }: { params: Promise<{ productId: string }> }) => {
    await WishlistService.requireAuth();
    const user = await getUser();

    if (!user?.id) {
      return createErrorResponse(API_ERROR_MESSAGES.USER_NOT_FOUND, {
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    const { productId: rawId } = await params;
    if (!rawId) {
      return createErrorResponse(API_ERROR_MESSAGES.MISSING_PRODUCT_ID, {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const portraitId = decodeURIComponent(rawId);
    const result = await WishlistService.removePortrait(portraitId, user.id);

    if (!result.success) {
      return createErrorResponse(API_ERROR_MESSAGES.FAILED_TO_REMOVE_PRODUCT_FROM_WISHLIST, {
        message: result.message || API_ERROR_MESSAGES.FAILED_TO_REMOVE_PRODUCT_FROM_WISHLIST,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    const wishlist = await WishlistService.getWishlist();
    return createSuccessResponse(wishlist, {
      message: 'Portrait removed from favourites',
      noCache: true,
    });
  },
);
