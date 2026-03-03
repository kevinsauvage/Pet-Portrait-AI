import {
  createErrorResult,
  createSuccessResult,
  handleCustomerUserErrors,
  handleUserErrors,
  zodErrorsToFormActionResult,
} from './form-actions';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

describe('createErrorResult', () => {
  it('returns an object with error field', () => {
    expect(createErrorResult('Something failed')).toEqual({ error: 'Something failed' });
  });
});

describe('createSuccessResult', () => {
  it('returns an object with success field', () => {
    expect(createSuccessResult('Operation succeeded')).toEqual({ success: 'Operation succeeded' });
  });
});

describe('zodErrorsToFormActionResult', () => {
  it('converts zod field errors to form action result format', () => {
    const schema = z.object({ email: z.string().email(), name: z.string().min(1) });
    const result = schema.safeParse({ email: 'bad', name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const formResult = zodErrorsToFormActionResult(result.error);
      expect(formResult.fieldErrors).toBeDefined();
      expect(formResult.fieldErrors?.email).toBeDefined();
    }
  });
});

describe('handleCustomerUserErrors', () => {
  it('returns null when errors array is empty', () => {
    expect(handleCustomerUserErrors([])).toBeNull();
  });

  it('returns null when errors is undefined', () => {
    expect(handleCustomerUserErrors(undefined)).toBeNull();
  });

  it('returns null when errors is null', () => {
    expect(handleCustomerUserErrors(null)).toBeNull();
  });

  it('returns customerUserErrors when errors are present', () => {
    const errors = [
      { field: ['email'], message: 'is invalid', __typename: 'CustomerUserError' as const },
    ];
    const result = handleCustomerUserErrors(errors);
    expect(result).toEqual({ customerUserErrors: errors });
  });
});

describe('handleUserErrors', () => {
  it('returns null when errors array is empty', () => {
    expect(handleUserErrors([])).toBeNull();
  });

  it('returns null when errors is undefined', () => {
    expect(handleUserErrors(undefined)).toBeNull();
  });

  it('returns userErrors when errors are present', () => {
    const errors = [
      { field: ['quantity'], message: 'must be positive', __typename: 'UserError' as const },
    ];
    const result = handleUserErrors(errors);
    expect(result).toEqual({ userErrors: errors });
  });
});
