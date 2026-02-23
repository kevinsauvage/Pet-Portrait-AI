import { type ArtStyleId, isValidStyleId, validStyleIdsLabel } from './types';

import { z } from 'zod';

const styleIdOptionsLabel = validStyleIdsLabel();

export const portraitGenerationRequestSchema = z.object({
  originalPhotoUrl: z.string().min(1, 'originalPhotoUrl is required'),
  styleId: z
    .string()
    .min(1, 'styleId is required')
    .refine(isValidStyleId, { message: `styleId must be one of: ${styleIdOptionsLabel}` }),
});

export type PortraitGenerationRequest = {
  originalPhotoUrl: string;
  styleId: ArtStyleId;
};

export function parsePortraitGenerationRequest(
  data: unknown,
): { success: true; data: PortraitGenerationRequest } | { success: false; error: z.ZodError } {
  const result = portraitGenerationRequestSchema.safeParse(data);
  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: {
      originalPhotoUrl: result.data.originalPhotoUrl,
      styleId: result.data.styleId as ArtStyleId,
    },
  };
}
