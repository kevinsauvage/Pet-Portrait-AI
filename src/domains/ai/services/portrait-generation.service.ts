import { withRetry } from '@/core/utils/retry';
import { getUploadUrl } from '@/infra/upload/get-upload-url';

import { AI_ART_STYLES, type ArtStyleId, type ArtworkGenerationResult } from '../ai-portrait/types';
import {
  logGenerationFailure,
  logGenerationSuccess,
} from '../repositories/generation-log.repository';

import * as Sentry from '@sentry/nextjs';
import { UTApi, UTFile } from 'uploadthing/server';
import { v4 as uuidv4 } from 'uuid';

const OPENAI_EDIT_URL = 'https://api.openai.com/v1/images/edits';
const VARIATIONS_COUNT = 2;

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

async function editImageWithOpenAI(
  apiKey: string,
  prompt: string,
  imageUrl: string,
): Promise<string> {
  const b64 = await withRetry(
    async () => {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok)
        throw new Error(`Failed to fetch source image: ${imageResponse.status}`);

      const imageBlob = await imageResponse.blob();
      const form = new FormData();
      form.append('model', 'gpt-image-1.5');
      form.append('prompt', prompt);
      form.append('image', imageBlob, 'pet.png');

      const rsp = await fetch(OPENAI_EDIT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
        body: form,
      });

      if (!rsp.ok) {
        const errText = await rsp.text();
        throw new Error(`OpenAI image edit failed: ${rsp.status} ${errText}`);
      }

      const json = (await rsp.json()) as { data?: Array<{ b64_json?: string | null }> };
      const data = json.data?.[0]?.b64_json ?? null;
      if (!data) throw new Error('No image data returned from OpenAI');
      return data;
    },
    {
      maxAttempts: 2,
      baseDelayMs: 2000,
      maxDelayMs: 6000,
      onAttemptFailed: (attempt, _maxAttempts, error) => {
        console.error('editImageWithOpenAI attempt failed:', { attempt, error });
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

  const generationId = uuidv4();
  const prompt = `Repaint this pet portrait ${getStylePrompt(styleId)}. Preserve the pet's breed, markings, eye color, and pose exactly. Fill the entire canvas. No text, no borders, no watermarks.`;

  try {
    const urls: string[] = [];
    for (let i = 0; i < VARIATIONS_COUNT; i++) {
      const b64 = await editImageWithOpenAI(apiKey, prompt, originalPhotoUrl);
      urls.push(await uploadBase64ToStorage(b64, `generated-${generationId}-${i + 1}.png`));
    }
    logGenerationSuccess(generationId, styleId);
    return { urls, generationId, styleId };
  } catch (error) {
    console.error('generatePetPortraitVariations failed:', error);
    logGenerationFailure(
      generationId,
      styleId,
      error instanceof Error ? error.message : String(error),
      originalPhotoUrl,
    );
    throw error;
  }
}
