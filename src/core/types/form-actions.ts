import type {
  CustomerUserError,
  UserError,
} from '@/infra/shopify/generated/storefront/index';

/**
 * Standardized return type for all form actions
 * Ensures consistent error handling and state management across all forms
 */
export type FormActionResult<
  TFieldErrors extends Record<string, string | string[]> = Record<string, string | string[]>,
> = {
  error?: string;
  success?: string;
  customerUserErrors?: CustomerUserError[];
  userErrors?: UserError[];
  fieldErrors?: TFieldErrors;
};
