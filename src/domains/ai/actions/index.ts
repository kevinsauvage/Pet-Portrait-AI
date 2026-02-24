'use server';

import { revalidatePath } from 'next/cache';

import type { FormActionResult } from '@/core/types/form-actions';
import { createErrorResult, createSuccessResult } from '@/core/utils/form-actions';
import { formatZodErrorMessage } from '@/core/utils/zod';

import { parsePortraitGenerationRequest } from '../ai-portrait/request';
import { generatePetPortraitVariations } from '../services/portrait-generation.service';

import * as Sentry from '@sentry/nextjs';

export async function regeneratePortraitAction(
  _prevState: FormActionResult,
  formData: FormData,
): Promise<FormActionResult> {
  const originalPhotoUrl = formData.get('originalPhotoUrl');
  const styleId = formData.get('styleId');

  const parsed = parsePortraitGenerationRequest({
    originalPhotoUrl: typeof originalPhotoUrl === 'string' ? originalPhotoUrl : '',
    styleId: typeof styleId === 'string' ? styleId : '',
  });

  if (!parsed.success) {
    return createErrorResult(formatZodErrorMessage(parsed.error));
  }

  try {
    await generatePetPortraitVariations(parsed.data.originalPhotoUrl, parsed.data.styleId);
    revalidatePath('/admin', 'layout');
    return createSuccessResult('Regeneration started');
  } catch (error) {
    Sentry.captureException(error, { tags: { context: 'admin-regenerate' } });
    return createErrorResult(error instanceof Error ? error.message : 'Regeneration failed');
  }
}
