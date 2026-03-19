/**
 * Client for the Printful preview API route.
 * Used by client components to fetch product mockup previews.
 */

import type { ApiSuccessResponse } from '@/core/utils/api-responses';
import { api } from '@/infra/http/api-client';

import type { PrintfulPreviewParams } from './types';

const PREVIEW_API_PATH = '/api/printful/preview';

export interface FetchPreviewResult {
  previewUrl: string | null;
}

/** Fetch product preview from our API. Throws on network/API errors. */
export async function fetchPrintfulPreview(
  params: PrintfulPreviewParams,
): Promise<FetchPreviewResult> {
  const response = await api.post<ApiSuccessResponse<FetchPreviewResult>>(PREVIEW_API_PATH, params);
  return {
    previewUrl: response.data?.previewUrl ?? null,
  };
}
