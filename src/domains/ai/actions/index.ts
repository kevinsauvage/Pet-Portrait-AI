'use server';

import { revalidatePath } from 'next/cache';

import type { FormActionResult } from '@/core/types/form-actions';
import { createErrorResult, createSuccessResult } from '@/core/utils/form-actions';
import { withRetry } from '@/core/utils/retry';
import { formatZodErrorMessage } from '@/core/utils/zod';
import { getUploadUrl } from '@/infra/upload/get-upload-url';

import { parsePortraitGenerationRequest } from '../ai-portrait/request';
import { AI_ART_STYLES, type ArtStyleId, type ArtworkGenerationResult } from '../ai-portrait/types';
import {
  logGenerationFailure,
  logGenerationSuccess,
} from '../repositories/generation-log.repository';

import * as Sentry from '@sentry/nextjs';
import OpenAI from 'openai';
import { UTApi, UTFile } from 'uploadthing/server';
import { v4 as uuidv4 } from 'uuid';
function getStylePrompt(styleId: ArtStyleId): string {
  return (
    AI_ART_STYLES.find((s) => s.id === styleId)?.promptSuffix ?? 'as a beautiful artistic portrait'
  );
}

async function uploadBase64ToStorage(base64Data: string, fileName: string): Promise<string> {
  const buffer = Buffer.from(base64Data, 'base64');
  const utapi = new UTApi();
  const file = new UTFile([buffer], `generated_art/${fileName}`, { type: 'image/png' });
  const result = await utapi.uploadFiles([file]);
  const url = getUploadUrl(result[0]?.data);
  if (!url) throw new Error('Failed to upload generated image to storage');
  return url;
}

async function generateImageWithRetry(
  openai: OpenAI,
  prompt: string,
  imageUrl: string,
): Promise<string> {
  const b64 = await withRetry(
    async () => {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.status}`);

      const response = await openai.images.edit({
        model: 'gpt-image-1',
        image: imageResponse,
        prompt,
        size: '1024x1024',
        quality: 'medium',
        n: 1,
      });

      const data = response.data?.[0]?.b64_json;
      if (!data) throw new Error('No image data returned from OpenAI');
      return data;
    },
    {
      maxAttempts: 3,
      baseDelayMs: 2000,
      maxDelayMs: 6000,
      onAttemptFailed: (attempt, _maxAttempts, error) => {
        Sentry.captureException(error, { tags: { context: 'ai-portrait-generate', attempt } });
      },
    },
  );

  if (!b64) throw new Error('AI generation failed after retries');
  return b64;
}

export async function generatePetPortraitVariations(
  originalPhotoUrl: string,
  styleId: ArtStyleId,
): Promise<ArtworkGenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const openai = new OpenAI({ apiKey });
  const generationId = uuidv4();
  const prompt = `Transform this pet photo into a professional portrait ${getStylePrompt(styleId)}. Keep the pet recognizable and maintain their key features. High quality, detailed, professional artwork.`;

  const generationPromises = Array.from({ length: 6 }, (_, i) =>
    generateImageWithRetry(openai, prompt, originalPhotoUrl).then((b64) =>
      uploadBase64ToStorage(b64, `generated-${generationId}-${i + 1}.png`),
    ),
  );

  try {
    const urls = await Promise.all(generationPromises);
    logGenerationSuccess(generationId, styleId);
    return { urls, generationId, styleId };
  } catch (error) {
    logGenerationFailure(
      generationId,
      styleId,
      error instanceof Error ? error.message : String(error),
      originalPhotoUrl,
    );
    throw error;
  }
}

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
