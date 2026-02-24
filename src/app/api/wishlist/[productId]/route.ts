import { type NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/core/utils/api-responses';
import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    await WishlistService.requireAuth();
    const user = await getUser();

    if (!user?.id) {
      return createErrorResponse('User not found', { status: HTTP_STATUS.NOT_FOUND });
    }

    const { productId: rawProductId } = await params;
    if (!rawProductId) {
      return createErrorResponse('Missing product ID', { status: HTTP_STATUS.BAD_REQUEST });
    }

    const productId = decodeURIComponent(rawProductId);
    const result = await WishlistService.removeProduct(productId, user.id);

    if (!result.success) {
      return createErrorResponse('Something went wrong removing the product from the wishlist', {
        message: result.message || 'Something went wrong removing the product from the wishlist',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    const wishlist = await WishlistService.getWishlist();
    return createSuccessResponse(wishlist, {
      message: 'Product correctly removed from wishlist',
      noCache: true,
    });
  } catch (error) {
    return handleApiError(
      'DELETE /api/wishlist/[productId]',
      error,
      'Failed to remove product from wishlist',
    );
  }
}
