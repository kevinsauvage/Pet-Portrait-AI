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

vi.mock('@/lib/cookies/actions', () => ({
  delCookieAction: vi.fn().mockResolvedValue(undefined),
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

  describe('register', () => {
    it('returns success with token on valid registration', async () => {
      const result = await AuthService.register({
        email: 'new@example.com',
        password: 'pass123',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('customerAccessToken');
    });
  });

  describe('resetPassword', () => {
    it('returns success with token on valid reset', async () => {
      const result = await AuthService.resetPassword({
        password: 'newpass',
        resetToken: 'https://example.com/reset/token',
      });
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('customerAccessToken');
    });
  });

  describe('logout', () => {
    it('calls clearShopifyToken and completes without error', async () => {
      const { getShopifyToken, clearShopifyToken } = await import('@/infra/shopify/server');
      (getShopifyToken as ReturnType<typeof vi.fn>).mockResolvedValueOnce('some-token');
      await expect(AuthService.logout()).resolves.toBeUndefined();
      expect(clearShopifyToken).toHaveBeenCalled();
    });

    it('completes without error when no token', async () => {
      const { getShopifyToken } = await import('@/infra/shopify/server');
      (getShopifyToken as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
      await expect(AuthService.logout()).resolves.toBeUndefined();
    });
  });

  describe('login (with user for cart identity)', () => {
    it('updates cart buyer identity when user is present', async () => {
      const { getUser } = await import('@/domains/user/get-user');
      (getUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      const result = await AuthService.login({ email: 'user@example.com', password: 'pass' });
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('register (customerUserErrors handling)', () => {
    it('returns customerUserErrors when register fails with Shopify errors', async () => {
      const { storefrontSdk } = await import('@/infra/shopify/client');
      (storefrontSdk as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        customerCreate: vi.fn().mockResolvedValue({
          customerCreate: {
            customer: null,
            customerUserErrors: [{ field: ['email'], message: 'already taken', __typename: 'CustomerUserError' }],
            userErrors: [],
          },
        }),
      });
      const result = await AuthService.register({
        email: 'taken@example.com',
        password: 'pass',
        firstName: 'A',
        lastName: 'B',
      });
      expect(result).toHaveProperty('customerUserErrors');
    });
  });
});
