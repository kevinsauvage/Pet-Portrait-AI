'use client';

import { api } from '@/infra/http/api-client';
import type { ProductFieldsFragment } from '@/infra/shopify/storefront';

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

export const addToWishlist = async (productId: string): Promise<WishlistResponse> => {
  return api.post<WishlistResponse>('/api/wishlist', { productId });
};

export const removeFromWishlist = async (productId: string): Promise<WishlistResponse> => {
  const encodedProductId = encodeURIComponent(productId);
  return api.delete<WishlistResponse>(`/api/wishlist/${encodedProductId}`);
};
