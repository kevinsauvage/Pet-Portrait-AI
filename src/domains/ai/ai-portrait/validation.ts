import { isTrustedHttpsImageHost } from '@/core/utils/trusted-https-image-host';

import {
  type ArtStyleId,
  IMAGE_CONSTRAINTS,
  isValidStyleId,
  type PortraitGenerationRequest,
  validStyleIdsLabel,
} from './types';

import { z } from 'zod';

const styleIdOptionsLabel = validStyleIdsLabel();

const allowedImageHostMessage =
  'originalPhotoUrl must be HTTPS from an allowed host (UploadThing, or hosts listed in ALLOWED_IMAGE_URL_HOSTS)';

export const portraitGenerationRequestSchema = z.object({
  originalPhotoUrl: z
    .string()
    .min(1, 'originalPhotoUrl is required')
    .url('originalPhotoUrl must be a valid URL')
    .refine(isTrustedHttpsImageHost, { message: allowedImageHostMessage }),
  styleId: z
    .string()
    .min(1, 'styleId is required')
    .refine(isValidStyleId, { message: `styleId must be one of: ${styleIdOptionsLabel}` }),
});

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

export const petPhotoSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= IMAGE_CONSTRAINTS.maxFileSize, 'File must be under 8MB')
    .refine(
      (f) => (IMAGE_CONSTRAINTS.acceptedTypes as readonly string[]).includes(f.type),
      'Only JPEG, PNG, and WebP are allowed',
    ),
});

export async function validateImageDimensions(
  file: File,
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      const aspectRatio = width / height;
      const { minDimension, maxDimension, minAspectRatio, maxAspectRatio } = IMAGE_CONSTRAINTS;

      if (width < minDimension || height < minDimension) {
        resolve({
          valid: false,
          error: `Image must be at least ${minDimension}x${minDimension}px`,
        });
        return;
      }
      if (width > maxDimension || height > maxDimension) {
        resolve({ valid: false, error: `Image must not exceed ${maxDimension}x${maxDimension}px` });
        return;
      }
      if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
        resolve({ valid: false, error: 'Image aspect ratio should be between 1:2 and 2:1' });
        return;
      }
      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: 'Could not read image dimensions' });
    };

    img.src = url;
  });
}
