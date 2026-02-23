'use server';

import { revalidatePath } from 'next/cache';

import type { FormActionResult } from '@/core/types/form-actions';
import { createErrorResult, createSuccessResult } from '@/core/utils/form-actions';
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
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

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

async function generateWithRetry(
  openai: OpenAI,
  prompt: string,
  imageUrl: string,
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const imageResponse = await fetch(imageUrl); // eslint-disable-line no-await-in-loop
      if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.status}`);

      const response = await openai.images.edit({
        model: 'gpt-image-1',
        image: imageResponse,
        prompt,
        size: '1024x1024',
        quality: 'medium',
        n: 1,
      });

      const b64 = response.data?.[0]?.b64_json;
      if (!b64) throw new Error('No image data returned from OpenAI');
      return b64;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      Sentry.captureException(error, { tags: { context: 'ai-portrait-generate', attempt } });
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt)); // eslint-disable-line no-await-in-loop
      }
    }
  }

  throw lastError ?? new Error('AI generation failed after retries');
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
    generateWithRetry(openai, prompt, originalPhotoUrl).then((b64) =>
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
