import { z } from 'zod';

export const printfulPreviewRequestSchema = z.object({
  variantId: z.number().int().positive('variantId must be a positive integer'),
  artworkUrl: z.string().url('artworkUrl must be a valid URL'),
});

export type PrintfulPreviewRequest = z.infer<typeof printfulPreviewRequestSchema>;
