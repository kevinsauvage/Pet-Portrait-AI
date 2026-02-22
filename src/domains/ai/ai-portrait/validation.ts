import { IMAGE_CONSTRAINTS } from './types';

import { z } from 'zod';

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
        resolve({ valid: false, error: `Image must be at least ${minDimension}x${minDimension}px` });
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
