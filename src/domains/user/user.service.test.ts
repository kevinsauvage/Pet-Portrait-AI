import { UserService } from './user.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/server', () => ({
  getShopifyToken: vi.fn(),
  setShopifyToken: vi.fn(),
}));

vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    customerUpdate: vi.fn().mockResolvedValue({
      customerUpdate: {
        customer: { id: 'cust-1' },
        customerAccessToken: 'new-token',
        customerUserErrors: [],
      },
    }),
  })),
}));

const { getShopifyToken } = await import('@/infra/shopify/server');

describe('UserService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const updateInput = {
    email: 'user@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
  };

  describe('updateUser', () => {
    it('returns error when user not logged in', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue(undefined);
      const result = await UserService.updateUser(updateInput);
      expect(result).toEqual({ error: 'User not logged in' });
    });

    it('returns success when update succeeds', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue('token' as never);
      const result = await UserService.updateUser(updateInput);
      expect(result).toHaveProperty('success', 'User updated successfully');
      expect(result).toHaveProperty('customer');
    });
  });
});
