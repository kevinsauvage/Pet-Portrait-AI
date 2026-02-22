import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { getUser } from '@/domains/user/get-user';
import { WISHLIST_MAX_ITEMS, WishlistService } from '@/domains/wishlist/services/wishlist.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const wishlist = await WishlistService.getWishlist();
    return createSuccessResponse(wishlist);
  } catch (error) {
    return handleApiError('GET /api/wishlist', error, 'Failed to fetch wishlist');
  }
}

export async function POST(request: NextRequest) {
  try {
    await WishlistService.requireAuth();
    const user = await getUser();

    if (!user?.id) {
      return createErrorResponse('User not found', { status: HTTP_STATUS.NOT_FOUND });
    }

    const body = await request.json();
    const { productId } = body as { productId: string };

    if (!productId || typeof productId !== 'string') {
      return createErrorResponse('Missing or invalid product ID', {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const currentWishlistIds = await WishlistService.getWishlistIds();

    if (currentWishlistIds.includes(productId)) {
      return createErrorResponse('Product already in wishlist', {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    if (currentWishlistIds.length >= WISHLIST_MAX_ITEMS) {
      return createErrorResponse('Wishlist is full', {
        message: `Wishlist is full. Maximum ${WISHLIST_MAX_ITEMS} items allowed.`,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const result = await WishlistService.addProduct(productId, user.id);

    if (!result.success || result.data === undefined) {
      return createErrorResponse("Couldn't add product to user wishlist", {
        message: result.message || "Couldn't add product to user wishlist",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    const wishlist = await WishlistService.getWishlist();
    return createSuccessResponse(wishlist, {
      message: 'Product correctly added to wishlist',
      noCache: true,
    });
  } catch (error) {
    const status = WishlistService.getErrorStatus(error);
    return createErrorResponse('Failed to add product to wishlist', {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status,
    });
  }
}
