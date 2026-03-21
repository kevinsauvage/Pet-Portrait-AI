import { isShopifyCustomerAuthFailure } from './customer-auth-failure';

import { ClientError } from 'graphql-request';
import { describe, expect, it } from 'vitest';

describe('isShopifyCustomerAuthFailure', () => {
  it('returns true for ClientError with status 401', () => {
    const err = new ClientError(
      { status: 401, headers: new Headers(), body: '' },
      { query: '', variables: {} },
    );
    expect(isShopifyCustomerAuthFailure(err)).toBe(true);
  });

  it('returns true for ClientError with UNAUTHENTICATED extension code', () => {
    const err = new ClientError(
      {
        status: 200,
        headers: new Headers(),
        body: '',
        errors: [{ message: 'Expired', extensions: { code: 'UNAUTHENTICATED' } }],
      } as unknown as ConstructorParameters<typeof ClientError>[0],
      { query: '', variables: {} },
    );
    expect(isShopifyCustomerAuthFailure(err)).toBe(true);
  });

  it('returns true for storefront fetch layer 401 message', () => {
    expect(
      isShopifyCustomerAuthFailure(new Error('Shopify fetch failed: 401 Unauthorized')),
    ).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isShopifyCustomerAuthFailure(new Error('Network down'))).toBe(false);
    expect(isShopifyCustomerAuthFailure(new Error('Unauthorized by proxy'))).toBe(false);
  });
});
