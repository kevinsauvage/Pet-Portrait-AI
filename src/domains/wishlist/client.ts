'use client';

import { api } from '@/infra/http/api-client';

import type { WishlistData } from './types';
import type { WishlistAddInput } from './validation';

type WishlistResponse = {
  success?: boolean;
  error?: boolean;
  message?: string;
  data?: WishlistData;
};

/** POST full portrait fields (`WishlistAddInput`); the API persists artwork, style, generation, optional variant/handle. */

export const addToWishlist = async (portrait: WishlistAddInput): Promise<WishlistResponse> => {
  return api.post<WishlistResponse>('/api/wishlist', portrait);
};

/** Removes by saved wishlist entry `id`, not Shopify product id. */
export const removeFromWishlist = async (portraitId: string): Promise<WishlistResponse> => {
  const encodedId = encodeURIComponent(portraitId);
  return api.delete<WishlistResponse>(`/api/wishlist/${encodedId}`);
};
