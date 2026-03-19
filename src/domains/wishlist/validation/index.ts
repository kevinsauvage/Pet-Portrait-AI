import { z } from 'zod';

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
