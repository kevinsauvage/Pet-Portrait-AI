import { CustomerOrdersService } from './customer-orders.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/server', () => ({
  getShopifyToken: vi.fn(),
}));

vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    getCustomerOrders: vi.fn().mockResolvedValue({
      customer: { orders: { edges: [], pageInfo: {} } },
    }),
  })),
}));

const { getShopifyToken } = await import('@/infra/shopify/server');

describe('CustomerOrdersService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCustomerOrders', () => {
    it('returns null when no token', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue(undefined);
      const result = await CustomerOrdersService.getCustomerOrders();
      expect(result).toBeNull();
    });

    it('returns orders when token present', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue('token' as never);
      const result = await CustomerOrdersService.getCustomerOrders();
      expect(result).not.toBeNull();
    });
  });
});
