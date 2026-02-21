import type { CustomerUserError, UserError } from '@/modules/shopify/storefront';
import type { FormActionResult } from '@/types/formActions';

import { flattenError } from 'zod';

/**
 * Converts Zod validation errors to standardized form action result format
 */
export function zodErrorsToFormActionResult<T extends Record<string, string | string[]>>(
  zodError: Parameters<typeof flattenError>[0],
): FormActionResult<T> {
  const { fieldErrors } = flattenError(zodError);
  return {
    fieldErrors: fieldErrors as T,
  };
}

/**
 * Creates a standardized error result
 */
export function createErrorResult(error: string): FormActionResult {
  return { error };
}

/**
 * Creates a standardized success result
 */
export function createSuccessResult(success: string): FormActionResult {
  return { success };
}

/**
 * Handles customerUserErrors from Shopify responses
 * Returns early if errors exist, otherwise returns null to continue execution
 */
export function handleCustomerUserErrors(
  customerUserErrors?: CustomerUserError[] | null,
): FormActionResult | null {
  if (customerUserErrors?.length) {
    return { customerUserErrors };
  }
  return null;
}

/**
 * Handles userErrors from Shopify responses (specifically for UserError type)
 * Returns early if errors exist, otherwise returns null to continue execution
 */
export function handleUserErrors(userErrors?: UserError[] | null): FormActionResult | null {
  if (userErrors?.length) {
    return { userErrors };
  }
  return null;
}

