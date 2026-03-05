import { redirect } from 'next/navigation';

import config from '@/core/config';

import { isValidStyleId } from '../types';

import { buildCreateFlowQueryString, type CreateFlowParams } from './create-flow-params';

export type CreateFlowStep = 'style' | 'generating' | 'collections' | 'order';

interface ValidationResult {
  isValid: boolean;
  redirectTo?: string;
}

/**
 * Validates create flow parameters for a given step and returns validation result.
 * Returns redirect URL if validation fails.
 */
export function validateCreateFlowStep(
  step: CreateFlowStep,
  params: CreateFlowParams & { productHandle?: string },
): ValidationResult {
  switch (step) {
    case 'style':
      if (!params.photo) {
        return { isValid: false, redirectTo: config.routes.create };
      }
      break;

    case 'generating':
      if (!params.photo || !params.styleId || !isValidStyleId(params.styleId)) {
        return { isValid: false, redirectTo: config.routes.create };
      }
      break;

    case 'collections':
      // Collections page doesn't require specific params - it can show empty state
      break;

    case 'order':
      if (!params.artwork) {
        return { isValid: false, redirectTo: config.routes.create };
      }
      if (!params.productHandle) {
        return {
          isValid: false,
          redirectTo: `${config.routes.createCollections}${buildCreateFlowQueryString({
            artwork: params.artwork,
            photo: params.photo,
            styleId: params.styleId,
            generationId: params.generationId,
            urls: params.urls,
          })}`,
        };
      }
      break;
    default:
      return { isValid: false, redirectTo: config.routes.create };
  }

  return { isValid: true };
}

/**
 * Validates and redirects if validation fails. Use in page components.
 */
export function validateAndRedirect(
  step: CreateFlowStep,
  params: CreateFlowParams & { productHandle?: string },
): void {
  const result = validateCreateFlowStep(step, params);
  if (!result.isValid && result.redirectTo) {
    redirect(result.redirectTo);
  }
}
