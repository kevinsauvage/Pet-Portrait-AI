'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { logger } from '@/core/utils/logger';
import { createCartAction } from '@/domains/cart/actions';
import cartMock from '@/domains/cart/mocks/cart';
import { DEFAULT_CART_PAGINATION } from '@/domains/cart/utils/pagination';
import { api } from '@/infra/http/api-client';
import type { CartFieldsFragment } from '@/infra/shopify/storefront';

import { toast } from 'sonner';

type CartResponse = { data: CartFieldsFragment; message?: string };

export type CartLineAttribute = { key: string; value: string };

interface CartContextType {
  cart: CartFieldsFragment;
  handleAddToCart: (
    variantId: string,
    quantity?: number,
    attributes?: CartLineAttribute[],
  ) => Promise<void>;
  handleQuantityChange: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (lineItemId: string) => Promise<void>;
  updateDiscountCodes: (discountCodes: string[]) => Promise<void>;
}

export const CartContext = createContext<CartContextType>({
  cart: {} as CartFieldsFragment,
  handleAddToCart: async () => {},
  handleQuantityChange: async () => {},
  removeFromCart: async () => {},
  updateDiscountCodes: async () => {},
});

const buildCartLinesUrl = (params?: { lineItemId?: string }): string => {
  const searchParams = new URLSearchParams({
    first: String(DEFAULT_CART_PAGINATION.first),
    last: String(DEFAULT_CART_PAGINATION.last),
    after: DEFAULT_CART_PAGINATION.after,
    before: DEFAULT_CART_PAGINATION.before,
  });

  if (params?.lineItemId) {
    searchParams.set('lineItemId', params.lineItemId);
  }

  return `/api/cart/lines?${searchParams.toString()}`;
};

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  return error instanceof Error ? error.message : defaultMessage;
};

export const CartProvider = ({
  children,
  initialCart,
}: {
  children: React.ReactNode;
  initialCart: CartFieldsFragment | null;
}) => {
  const [cart, setCart] = useState<CartFieldsFragment>(initialCart || cartMock);

  useEffect(() => {
    if (!initialCart) {
      createCartAction()
        .then(setCart)
        .catch((error) => {
          logger.error('Failed to create cart', { context: 'cart.create', error });
          toast.error('Failed to initialize cart');
        });
    }
  }, [initialCart]);

  const handleResponse = useCallback((response: CartResponse) => {
    setCart(response.data);
    if (response.message) {
      toast.success(response.message);
    }
  }, []);

  const removeFromCart = useCallback(
    async (lineItemId: string) => {
      if (!lineItemId) {
        logger.error('Missing line item ID', { context: 'cart.remove', error: new Error('Missing line item ID') });
        return;
      }

      try {
        const response = await api.delete<CartResponse>(buildCartLinesUrl({ lineItemId }));
        handleResponse(response);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to remove item'));
      }
    },
    [handleResponse],
  );

  const handleQuantityChange = useCallback(
    async (id: string, quantity: number) => {
      if (!id || !quantity) {
        logger.error('Missing required parameters: id or quantity', { context: 'cart.quantity', error: new Error('Missing required parameters: id or quantity') });
        return;
      }

      try {
        const response = await api.patch<CartResponse>(buildCartLinesUrl(), {
          lines: [{ id, quantity }],
          operation: 'update',
        });
        handleResponse(response);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to update cart'));
      }
    },
    [handleResponse],
  );

  const handleAddToCart = useCallback(
    async (variantId: string, quantity = 1, attributes?: CartLineAttribute[]) => {
      if (!variantId) {
        logger.error('Missing variant ID', { context: 'cart.add', error: new Error('Missing variant ID') });
        return;
      }

      try {
        const response = await api.patch<CartResponse>(buildCartLinesUrl(), {
          addLines: [
            {
              merchandiseId: variantId,
              quantity,
              ...(attributes?.length ? { attributes } : {}),
            },
          ],
          operation: 'add',
        });
        handleResponse(response);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to add to cart'));
      }
    },
    [handleResponse],
  );

  const updateDiscountCodes = useCallback(
    async (discountCodes: string[]) => {
      if (!Array.isArray(discountCodes)) {
        logger.error('Invalid discount codes format', { context: 'cart.discount-codes', error: new Error('Invalid discount codes format') });
        return;
      }

      const validCodes = discountCodes
        .map((code) => String(code).trim())
        .filter((code) => code.length > 0);

      try {
        const response = await api.patch<CartResponse>('/api/cart/discount-codes', {
          discountCodes: validCodes,
        });
        handleResponse(response);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to update discount codes'));
      }
    },
    [handleResponse],
  );

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      handleAddToCart,
      handleQuantityChange,
      removeFromCart,
      updateDiscountCodes,
    }),
    [cart, handleAddToCart, handleQuantityChange, removeFromCart, updateDiscountCodes],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
