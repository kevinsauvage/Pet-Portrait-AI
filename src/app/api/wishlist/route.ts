import { type NextRequest } from 'next/server';

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
    const parsedBody = wishlistAddSchema.safeParse(body);
    if (!parsedBody.success) {
      return createErrorResponse('Missing or invalid product ID', {
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

      return createErrorResponse('Failed to add product to wishlist', {
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
    const status = WishlistService.getErrorStatus(error);
    return createErrorResponse('Failed to add product to wishlist', {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status,
    });
  }
}
