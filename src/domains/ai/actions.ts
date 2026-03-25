'use server';

import { logger } from '@/core/utils/logger.server';
import { formatZodErrorMessage } from '@/core/utils/zod';
import { CreationsService } from '@/domains/creations/creations.service';
import { getUser } from '@/domains/user/get-user';

import { parsePortraitGenerationRequest } from './ai-portrait/request';
import type { ArtworkGenerationResult } from './ai-portrait/types';
import { validateImageFromUrl } from './ai-portrait/validate-image';
import { generatePetPortraitVariations } from './portrait-generation.service';

import * as Sentry from '@sentry/nextjs';

/**
 * Server action for generating pet portrait variations
 * This can be called directly from server components or client components
 */
export async function generatePortraitAction(
  imageUrl: string,
  styleId: string,
): Promise<{ success: true; data: ArtworkGenerationResult } | { success: false; error: string }> {
  const parsed = parsePortraitGenerationRequest({
    imageUrl,
    styleId,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: formatZodErrorMessage(parsed.error),
    };
  }

  try {
    const validation = await validateImageFromUrl(parsed.data.imageUrl);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error ?? 'Invalid image',
      };
    }

    const result = await generatePetPortraitVariations(
      parsed.data.imageUrl,
      parsed.data.styleId,
    );

    // Auto-save the creation for logged-in users — fire-and-forget, non-blocking
    getUser()
      .then((user) => {
        if (!user?.id) return;
        return CreationsService.addCreation(
          {
            generatedUrls: result.urls,
            styleId: result.styleId,
            generationId: result.generationId,
          },
          user.id,
        );
      })
      .catch((err) => {
        logger.error('Failed to auto-save creation', {
          context: 'generatePortraitAction',
          error: err,
        });
      });

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
