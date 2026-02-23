import { z } from 'zod';

export const wishlistAddSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export type WishlistAddInput = z.infer<typeof wishlistAddSchema>;
