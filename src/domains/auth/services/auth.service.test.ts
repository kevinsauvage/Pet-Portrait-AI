import { AuthService } from './auth.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/server', () => ({
  getShopifyToken: vi.fn(),
  setShopifyToken: vi.fn(),
  clearShopifyToken: vi.fn(),
}));

const mockCustomerAccessTokenCreate = vi.fn().mockResolvedValue({
  customerAccessTokenCreate: {
    customerAccessToken: { accessToken: 'token' },
    customerUserErrors: [],
  },
});
vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    customerCreate: vi.fn().mockResolvedValue({
      customerCreate: { customer: {}, customerUserErrors: [], userErrors: [] },
    }),
    customerAccessTokenCreate: mockCustomerAccessTokenCreate,
    customerRecover: vi.fn().mockResolvedValue({
      customerRecover: { customerUserErrors: [] },
    }),
    customerResetByUrl: vi.fn().mockResolvedValue({
      customerResetByUrl: {
        customerAccessToken: { accessToken: 'token' },
        customerUserErrors: [],
      },
    }),
    customerAccessTokenDelete: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('@/domains/user/get-user', () => ({
  getUser: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/infra/http/api-client', () => ({
  api: { patch: vi.fn().mockResolvedValue({ data: {} }) },
}));

describe('AuthService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('returns success with token for valid credentials', async () => {
      const result = await AuthService.login({ email: 'user@example.com', password: 'pass' });
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('customerAccessToken');
    });

    it('returns error when token creation fails', async () => {
      mockCustomerAccessTokenCreate.mockResolvedValueOnce({
        customerAccessTokenCreate: { customerAccessToken: null, customerUserErrors: [] },
      });
      const result = await AuthService.login({ email: 'user@example.com', password: 'wrong' });
      expect(result).toHaveProperty('error', 'Invalid email or password');
    });
  });

  describe('recoverPassword', () => {
    it('returns success for valid email', async () => {
      const result = await AuthService.recoverPassword({ email: 'user@example.com' });
      expect(result).toHaveProperty('success', true);
    });
  });
});
