import { isArtworkUrlHostnameAllowed } from '@/domains/printful/allowed-artwork-url';

import { z } from 'zod';

export const printfulPreviewRequestSchema = z.object({
  variantId: z.number().int().positive('variantId must be a positive integer'),
  artworkUrl: z.string().url('artworkUrl must be a valid URL').refine(isArtworkUrlHostnameAllowed, {
    message:
      'artworkUrl must be from an allowed host (UploadThing: utfs.io, *.utfs.io, ufs.sh, *.ufs.sh)',
  }),
});

export type PrintfulPreviewRequest = z.infer<typeof printfulPreviewRequestSchema>;
