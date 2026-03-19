'use client';

import { api } from '@/infra/http/api-client';

import type { SavedPortrait } from './types';
import type { WishlistAddInput } from './validation';

type WishlistResponse = {
  success?: boolean;
  error?: boolean;
  message?: string;
  data?: SavedPortrait[];
};

export const savePortraitToWishlist = async (
  input: WishlistAddInput,
): Promise<WishlistResponse> => {
  return api.post<WishlistResponse>('/api/wishlist', input);
};

export const removePortraitFromWishlist = async (portraitId: string): Promise<WishlistResponse> => {
  const encodedId = encodeURIComponent(portraitId);
  return api.delete<WishlistResponse>(`/api/wishlist/${encodedId}`);
};
