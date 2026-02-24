import { CartService } from './cart.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => ({ value: 'cart-123' })),
      set: vi.fn(),
    }),
  ),
}));

const mockGetCart = vi.fn().mockResolvedValue({ cart: { id: 'cart-123' } });
vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    getCart: mockGetCart,
    cartCreate: vi.fn().mockResolvedValue({
      cartCreate: { cart: { id: 'new-cart' }, userErrors: [], warnings: [] },
    }),
    cartLinesAdd: vi.fn().mockResolvedValue({ cartLinesAdd: { cart: {}, userErrors: [] } }),
    cartLinesUpdate: vi.fn().mockResolvedValue({ cartLinesUpdate: { cart: {}, userErrors: [] } }),
    cartLinesRemove: vi.fn().mockResolvedValue({ cartLinesRemove: { cart: {}, userErrors: [] } }),
    cartDiscountCodesUpdate: vi.fn().mockResolvedValue({
      cartDiscountCodesUpdate: { cart: {}, userErrors: [] },
    }),
    cartBuyerIdentityUpdate: vi.fn().mockResolvedValue({
      cartBuyerIdentityUpdate: { cart: {}, userErrors: [] },
    }),
  })),
}));

describe('CartService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCartId', () => {
    it('returns cart id from cookies', async () => {
      const cartId = await CartService.getCartId();
      expect(cartId).toBe('cart-123');
    });
  });

  describe('getCart', () => {
    it('returns cart when found', async () => {
      const cart = await CartService.getCart('cart-123');
      expect(cart).toEqual({ id: 'cart-123' });
    });

    it('returns null when storefront throws', async () => {
      mockGetCart.mockRejectedValueOnce(new Error('Network error'));
      const cart = await CartService.getCart('cart-123');
      expect(cart).toBeNull();
    });
  });

  describe('addLines', () => {
    it('maps lines and calls storefront', async () => {
      const result = await CartService.addLines('cart-123', [
        { merchandiseId: 'var-1', quantity: 2 },
      ]);
      expect(result).not.toBeNull();
      expect(result?.cart).toBeDefined();
    });
  });
});
