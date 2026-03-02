'use server';

import { revalidatePath } from 'next/cache';

import type { FormActionResult } from '@/core/types/form-actions';
import { createErrorResult, createSuccessResult } from '@/core/utils/form-actions';
import { formatZodErrorMessage } from '@/core/utils/zod';

import { parsePortraitGenerationRequest } from '../ai-portrait/request';
import type { ArtworkGenerationResult } from '../ai-portrait/types';
import { validateImageFromUrl } from '../ai-portrait/validate-image';
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

/**
 * Server action for generating pet portrait variations
 * This can be called directly from server components or client components
 */
export async function generatePortraitAction(
  originalPhotoUrl: string,
  styleId: string,
): Promise<{ success: true; data: ArtworkGenerationResult } | { success: false; error: string }> {
  const parsed = parsePortraitGenerationRequest({
    originalPhotoUrl,
    styleId,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: formatZodErrorMessage(parsed.error),
    };
  }

  try {
    const validation = await validateImageFromUrl(parsed.data.originalPhotoUrl);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error ?? 'Invalid image',
      };
    }

    const result = await generatePetPortraitVariations(
      parsed.data.originalPhotoUrl,
      parsed.data.styleId,
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    Sentry.captureException(error, { tags: { context: 'ai-portrait-generate-action' } });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}
