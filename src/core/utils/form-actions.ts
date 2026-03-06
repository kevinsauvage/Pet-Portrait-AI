import type { FormActionResult } from '@/core/types/form-actions';
import type {
  CustomerUserError,
  UserError,
} from '@/infra/shopify/generated/storefront/index';

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

function handleUserErrorArray<E extends CustomerUserError | UserError>(
  errors: E[] | undefined | null,
  key: 'customerUserErrors' | 'userErrors',
): FormActionResult | null {
  if (errors?.length) {
    return { [key]: errors } as FormActionResult;
  }
  return null;
}

/** Handles customerUserErrors from Shopify responses */
export function handleCustomerUserErrors(
  customerUserErrors?: CustomerUserError[] | null,
): FormActionResult | null {
  return handleUserErrorArray(customerUserErrors, 'customerUserErrors');
}

/** Handles userErrors from Shopify responses */
export function handleUserErrors(userErrors?: UserError[] | null): FormActionResult | null {
  return handleUserErrorArray(userErrors, 'userErrors');
}
