'use client';

import type { ProductFieldsFragment } from '@/modules/shopify/storefront';
import { api } from '@/utils/api-client';

type WishlistResponse = {
  success?: boolean;
  error?: boolean;
  message?: string;
  data?: ProductFieldsFragment[];
};

/**
 * Client-side wishlist API utilities
 * Functions for adding/removing products from wishlist via API
 */

/**
 * Add a product to wishlist by sending only the product ID
 */
export const addToWishlist = async (productId: string): Promise<WishlistResponse> => {
  return api.post<WishlistResponse>('/api/wishlist', { productId });
};

/**
 * Remove a product from wishlist by product ID
 */
export const removeFromWishlist = async (productId: string): Promise<WishlistResponse> => {
  const encodedProductId = encodeURIComponent(productId);
  return api.delete<WishlistResponse>(`/api/wishlist/${encodedProductId}`);
};

