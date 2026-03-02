/**
 * Utility functions for building URL search parameters in the create flow
 */

export interface CreateFlowParams {
  artwork?: string;
  photo?: string;
  styleId?: string;
  generationId?: string;
  urls?: string;
}

/**
 * Builds URLSearchParams from create flow parameters
 * Only includes parameters that have values
 */
export function buildCreateFlowParams(params: CreateFlowParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.artwork) searchParams.set('artwork', params.artwork);
  if (params.photo) searchParams.set('photo', params.photo);
  if (params.styleId) searchParams.set('styleId', params.styleId);
  if (params.generationId) searchParams.set('generationId', params.generationId);
  if (params.urls) searchParams.set('urls', params.urls);

  return searchParams;
}

/**
 * Builds a query string from create flow parameters
 * Returns empty string if no parameters provided
 */
export function buildCreateFlowQueryString(params: CreateFlowParams): string {
  const searchParams = buildCreateFlowParams(params);
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
