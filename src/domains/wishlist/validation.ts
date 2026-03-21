import type { WishlistData } from './types';

import { z } from 'zod';

/** Max portraits stored in the customer metafield (read and write). */
export const WISHLIST_MAX_ITEMS = 50;

export const savedPortraitSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().url(),
  originalPhotoUrl: z.string().url(),
  styleId: z.string().min(1),
  generationId: z.string().min(1),
  label: z.string().optional(),
  savedAt: z.string().min(1),
  variantId: z.string().optional(),
  productHandle: z.string().optional(),
});

/**
 * Validates wishlist JSON after `JSON.parse`. Drops invalid entries; caps length before parsing each row.
 */
export function parseWishlistMetafieldJson(parsed: unknown): WishlistData {
  if (!Array.isArray(parsed)) return [];
  const capped = parsed.slice(0, WISHLIST_MAX_ITEMS);
  const out: WishlistData = [];
  for (const item of capped) {
    const row = savedPortraitSchema.safeParse(item);
    if (row.success) out.push(row.data);
  }
  return out;
}

export const wishlistAddSchema = z.object({
  imageUrl: z.string().url('A valid image URL is required'),
  originalPhotoUrl: z.string().url('A valid original photo URL is required'),
  styleId: z.string().min(1, 'Style ID is required'),
  generationId: z.string().min(1, 'Generation ID is required'),
  label: z.string().optional(),
  variantId: z.string().optional(),
  productHandle: z.string().optional(),
});

export type WishlistAddInput = z.infer<typeof wishlistAddSchema>;
