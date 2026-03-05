import { CartService } from './cart.service';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookies)),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockGetCart = vi.fn();
const mockCartCreate = vi.fn();
const mockCartLinesAdd = vi.fn();
const mockCartLinesUpdate = vi.fn();
const mockCartLinesRemove = vi.fn();
const mockCartDiscountCodesUpdate = vi.fn();
const mockCartBuyerIdentityUpdate = vi.fn();

vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    getCart: mockGetCart,
    cartCreate: mockCartCreate,
    cartLinesAdd: mockCartLinesAdd,
    cartLinesUpdate: mockCartLinesUpdate,
    cartLinesRemove: mockCartLinesRemove,
    cartDiscountCodesUpdate: mockCartDiscountCodesUpdate,
    cartBuyerIdentityUpdate: mockCartBuyerIdentityUpdate,
  })),
}));

describe('CartService', () => {
  beforeEach(() => {
    mockCookies.get.mockReturnValue({ value: 'cart-123' });
    mockGetCart.mockResolvedValue({ cart: { id: 'cart-123', lines: { edges: [] } } });
    mockCartCreate.mockResolvedValue({
      cartCreate: { cart: { id: 'new-cart', lines: { edges: [] } }, userErrors: [], warnings: [] },
    });
    mockCartLinesAdd.mockResolvedValue({
      cartLinesAdd: { cart: { id: 'cart-123', lines: { edges: [] } }, userErrors: [] },
    });
    mockCartLinesUpdate.mockResolvedValue({
      cartLinesUpdate: { cart: { id: 'cart-123', lines: { edges: [] } }, userErrors: [] },
    });
    mockCartLinesRemove.mockResolvedValue({
      cartLinesRemove: { cart: { id: 'cart-123', lines: { edges: [] } }, userErrors: [] },
    });
    mockCartDiscountCodesUpdate.mockResolvedValue({
      cartDiscountCodesUpdate: {
        cart: { id: 'cart-123', discountCodes: [] },
        userErrors: [],
        warnings: [],
      },
    });
    mockCartBuyerIdentityUpdate.mockResolvedValue({
      cartBuyerIdentityUpdate: { cart: { id: 'cart-123' }, userErrors: [] },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCartId', () => {
    it('returns cart id from cookies', async () => {
      const cartId = await CartService.getCartId();
      expect(cartId).toBe('cart-123');
    });

    it('returns null when no cart cookie exists', async () => {
      mockCookies.get.mockReturnValue(undefined);
      const cartId = await CartService.getCartId();
      expect(cartId).toBeNull();
    });
  });

  describe('getCart', () => {
    it('returns cart when found', async () => {
      const cart = await CartService.getCart('cart-123');
      expect(cart).toEqual({ id: 'cart-123', lines: { edges: [] } });
      expect(mockGetCart).toHaveBeenCalledWith({ cartId: 'cart-123', first: 100 });
    });

    it('throws error when storefront throws', async () => {
      const networkError = new Error('Network error');
      mockGetCart.mockRejectedValueOnce(networkError);
      await expect(CartService.getCart('cart-123')).rejects.toThrow('Network error');
    });

    it('returns null when cart is not found', async () => {
      mockGetCart.mockResolvedValueOnce({ cart: null });
      const cart = await CartService.getCart('cart-123');
      expect(cart).toBeNull();
    });
  });

  describe('createCart', () => {
    it('creates a new cart and sets cookie', async () => {
      const cart = await CartService.createCart();
      expect(cart.id).toBe('new-cart');
      expect(mockCookies.set).toHaveBeenCalled();
    });

    it('throws error when cart creation fails with user errors', async () => {
      mockCartCreate.mockResolvedValueOnce({
        cartCreate: {
          cart: null,
          userErrors: [{ message: 'Invalid input' }],
          warnings: [],
        },
      });
      await expect(CartService.createCart()).rejects.toThrow('Invalid input');
    });

    it('throws error when cart has no id', async () => {
      mockCartCreate.mockResolvedValueOnce({
        cartCreate: { cart: {}, userErrors: [], warnings: [] },
      });
      await expect(CartService.createCart()).rejects.toThrow('Failed to create cart');
    });
  });

  describe('getOrCreateCart', () => {
    it('returns existing cart when found', async () => {
      const cart = await CartService.getOrCreateCart();
      expect(cart.id).toBe('cart-123');
      expect(mockCartCreate).not.toHaveBeenCalled();
    });

    it('creates new cart when no cart exists', async () => {
      mockCookies.get.mockReturnValue(undefined);
      const cart = await CartService.getOrCreateCart();
      expect(cart.id).toBe('new-cart');
      expect(mockCartCreate).toHaveBeenCalled();
    });

    it('creates new cart when existing cart is invalid', async () => {
      mockGetCart.mockResolvedValueOnce({ cart: null });
      const cart = await CartService.getOrCreateCart();
      expect(cart.id).toBe('new-cart');
      expect(mockCartCreate).toHaveBeenCalled();
    });

    it('throws error when fetching existing cart fails', async () => {
      const networkError = new Error('Network error');
      mockGetCart.mockRejectedValueOnce(networkError);
      await expect(CartService.getOrCreateCart()).rejects.toThrow('Network error');
      expect(mockCartCreate).not.toHaveBeenCalled();
    });
  });

  describe('getExistingCart', () => {
    it('returns cart when cart id exists', async () => {
      const cart = await CartService.getExistingCart();
      expect(cart).not.toBeNull();
      expect(cart?.id).toBe('cart-123');
    });

    it('returns null when no cart id exists', async () => {
      mockCookies.get.mockReturnValue(undefined);
      const cart = await CartService.getExistingCart();
      expect(cart).toBeNull();
    });

    it('returns null when fetching cart fails', async () => {
      const networkError = new Error('Network error');
      mockGetCart.mockRejectedValueOnce(networkError);
      const cart = await CartService.getExistingCart();
      expect(cart).toBeNull();
    });
  });

  describe('addLines', () => {
    it('adds lines to cart with default quantity', async () => {
      const result = await CartService.addLines('cart-123', [{ merchandiseId: 'var-1' }]);
      expect(result).not.toBeNull();
      expect(result?.cart).toBeDefined();
      expect(mockCartLinesAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          cartId: 'cart-123',
          lines: [{ merchandiseId: 'var-1', quantity: 1 }],
        }),
      );
    });

    it('adds lines with custom quantity', async () => {
      const result = await CartService.addLines('cart-123', [
        { merchandiseId: 'var-1', quantity: 2 },
      ]);
      expect(result).not.toBeNull();
      expect(mockCartLinesAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          lines: [{ merchandiseId: 'var-1', quantity: 2 }],
        }),
      );
    });

    it('adds lines with attributes', async () => {
      const result = await CartService.addLines('cart-123', [
        {
          merchandiseId: 'var-1',
          quantity: 1,
          attributes: [{ key: 'gelato_print_url', value: 'https://example.com/image.png' }],
        },
      ]);
      expect(result).not.toBeNull();
      expect(mockCartLinesAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          lines: [
            {
              merchandiseId: 'var-1',
              quantity: 1,
              attributes: [{ key: 'gelato_print_url', value: 'https://example.com/image.png' }],
            },
          ],
        }),
      );
    });

    it('handles pagination parameters', async () => {
      await CartService.addLines('cart-123', [{ merchandiseId: 'var-1' }], {
        first: 50,
        after: 'cursor-123',
      });
      expect(mockCartLinesAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 50,
          after: 'cursor-123',
        }),
      );
    });
  });

  describe('updateLines', () => {
    it('updates cart lines', async () => {
      const result = await CartService.updateLines('cart-123', [{ id: 'line-1', quantity: 3 }]);
      expect(result).not.toBeNull();
      expect(result?.cart).toBeDefined();
      expect(mockCartLinesUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          cartId: 'cart-123',
          lines: [{ id: 'line-1', quantity: 3 }],
        }),
      );
    });

    it('handles pagination parameters', async () => {
      await CartService.updateLines('cart-123', [{ id: 'line-1', quantity: 2 }], {
        first: 50,
      });
      expect(mockCartLinesUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 50,
        }),
      );
    });
  });

  describe('removeLines', () => {
    it('removes lines from cart', async () => {
      const result = await CartService.removeLines('cart-123', ['line-1', 'line-2']);
      expect(result).not.toBeNull();
      expect(result?.cart).toBeDefined();
      expect(mockCartLinesRemove).toHaveBeenCalledWith(
        expect.objectContaining({
          cartId: 'cart-123',
          lineIds: ['line-1', 'line-2'],
        }),
      );
    });

    it('handles pagination parameters', async () => {
      await CartService.removeLines('cart-123', ['line-1'], { first: 50 });
      expect(mockCartLinesRemove).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 50,
        }),
      );
    });
  });

  describe('updateDiscountCodes', () => {
    it('updates discount codes', async () => {
      const result = await CartService.updateDiscountCodes('cart-123', ['DISCOUNT10']);
      expect(result).not.toBeNull();
      expect(result?.cart).toBeDefined();
      expect(mockCartDiscountCodesUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          cartId: 'cart-123',
          discountCodes: ['DISCOUNT10'],
        }),
      );
    });

    it('handles multiple discount codes', async () => {
      await CartService.updateDiscountCodes('cart-123', ['DISCOUNT10', 'SAVE20']);
      expect(mockCartDiscountCodesUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          discountCodes: ['DISCOUNT10', 'SAVE20'],
        }),
      );
    });

    it('handles empty discount codes array', async () => {
      await CartService.updateDiscountCodes('cart-123', []);
      expect(mockCartDiscountCodesUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          discountCodes: [],
        }),
      );
    });
  });

  describe('updateBuyerIdentity', () => {
    it('updates buyer identity', async () => {
      const buyerIdentity = {
        email: 'test@example.com',
        phone: '+1234567890',
      };
      const result = await CartService.updateBuyerIdentity('cart-123', buyerIdentity);
      expect(result).not.toBeNull();
      expect(result?.cart).toBeDefined();
      expect(mockCartBuyerIdentityUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          cartId: 'cart-123',
          buyerIdentity,
        }),
      );
    });

    it('handles pagination parameters', async () => {
      await CartService.updateBuyerIdentity(
        'cart-123',
        { email: 'test@example.com' },
        {
          first: 50,
        },
      );
      expect(mockCartBuyerIdentityUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 50,
        }),
      );
    });
  });

  describe('getCartById', () => {
    it('delegates to getCart', async () => {
      const cart = await CartService.getCartById('cart-123');
      expect(cart).toEqual({ id: 'cart-123', lines: { edges: [] } });
      expect(mockGetCart).toHaveBeenCalledWith({ cartId: 'cart-123', first: 100 });
    });
  });
});
