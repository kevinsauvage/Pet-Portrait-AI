import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import config from '@/core/config';
import { mapShopifyUserErrors, safeLogError } from '@/core/utils/api-responses';
import { getSecureCookieOptions } from '@/core/utils/cookie-security';
import { storefrontSdk } from '@/infra/shopify/client';
import { adjustPaginationVariables } from '@/infra/shopify/helpers';
import type { CartBuyerIdentityInput, CartFieldsFragment } from '@/infra/shopify/storefront';

type CartLineInput = {
  id: string;
  quantity: number;
};

type CartLineAttributeInput = {
  key: string;
  value: string;
};

type CartLineAddInput = {
  merchandiseId: string;
  quantity?: number;
  attributes?: CartLineAttributeInput[];
};

type CartPagination = {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
};

type CartLinesResponse = {
  cart?: CartFieldsFragment | null;
  userErrors?: Array<{ field?: string[] | null; message: string }>;
};

type CartDiscountCodesResponse = CartLinesResponse & {
  warnings?: Array<{ code?: string | null; message?: string | null }>;
};

export class CartService {
  static async getCart(cartId: string): Promise<CartFieldsFragment | null> {
    try {
      const response = await storefrontSdk('no-store').getCart({
        cartId,
        ...adjustPaginationVariables({ first: 100 }),
      });

      return response?.cart || null;
    } catch (error) {
      safeLogError('CartService.getCart', error);
      return null;
    }
  }

  static async createCart(): Promise<CartFieldsFragment> {
    const createCartResponse = await storefrontSdk('no-store').cartCreate({
      ...adjustPaginationVariables({ first: 100 }),
    });

    const { cart, userErrors, warnings } = createCartResponse.cartCreate || {};

    if (warnings && Array.isArray(warnings) && warnings?.length) {
      safeLogError('CartService.createCart - warnings', warnings);
    }

    const mappedUserErrors = mapShopifyUserErrors(userErrors);
    if (mappedUserErrors) {
      safeLogError('CartService.createCart - user errors', mappedUserErrors);
      if (!cart?.id) {
        throw new Error(
          mappedUserErrors[0]?.message || 'Failed to create cart due to validation errors',
        );
      }
    }

    if (!cart?.id) {
      throw new Error('Failed to create cart');
    }

    const cookieStore = await cookies();
    cookieStore.set(config.cookies.cartId, cart.id, getSecureCookieOptions());

    this.revalidate();

    return cart;
  }

  static async getOrCreateCart(): Promise<CartFieldsFragment> {
    const cartId = await this.getCartId();

    if (cartId) {
      const cart = await this.getCart(cartId);
      if (cart) {
        return cart;
      }
    }

    return this.createCart();
  }

  static async getCartById(cartId: string): Promise<CartFieldsFragment | null> {
    return this.getCart(cartId);
  }

  static async getCartId(): Promise<string | null> {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(config.cookies.cartId)?.value;
    return cartId || null;
  }

  static async getExistingCart(): Promise<CartFieldsFragment | null> {
    const cartId = await this.getCartId();
    return cartId ? this.getCart(cartId) : null;
  }

  static async addLines(
    cartId: string,
    lines: CartLineAddInput[],
    pagination: CartPagination = { first: 100 },
  ): Promise<CartLinesResponse | null> {
    const cartLines = lines.map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: line.quantity ?? 1,
      ...(line.attributes?.length ? { attributes: line.attributes } : {}),
    }));

    const response = await storefrontSdk('no-store').cartLinesAdd({
      cartId,
      lines: cartLines,
      ...adjustPaginationVariables({
        after: pagination.after,
        before: pagination.before,
        first: pagination.first ?? 100,
        last: pagination.last,
      }),
    });

    return response?.cartLinesAdd || null;
  }

  static async updateLines(
    cartId: string,
    lines: CartLineInput[],
    pagination: CartPagination = { first: 100 },
  ): Promise<CartLinesResponse | null> {
    const response = await storefrontSdk('no-store').cartLinesUpdate({
      cartId,
      lines,
      ...adjustPaginationVariables({
        after: pagination.after,
        before: pagination.before,
        first: pagination.first ?? 100,
        last: pagination.last,
      }),
    });

    return response?.cartLinesUpdate || null;
  }

  static async removeLines(
    cartId: string,
    lineIds: string[],
    pagination: CartPagination = { first: 100 },
  ): Promise<CartLinesResponse | null> {
    const response = await storefrontSdk('no-store').cartLinesRemove({
      cartId,
      lineIds,
      ...adjustPaginationVariables({
        after: pagination.after,
        before: pagination.before,
        first: pagination.first ?? 100,
        last: pagination.last,
      }),
    });

    return response?.cartLinesRemove || null;
  }

  static async updateDiscountCodes(
    cartId: string,
    discountCodes: string[],
    pagination: CartPagination = { first: 100 },
  ): Promise<CartDiscountCodesResponse | null> {
    const response = await storefrontSdk('no-store').cartDiscountCodesUpdate({
      cartId,
      discountCodes,
      ...adjustPaginationVariables({
        after: pagination.after,
        before: pagination.before,
        first: pagination.first ?? 100,
        last: pagination.last,
      }),
    });

    return response?.cartDiscountCodesUpdate || null;
  }

  static async updateBuyerIdentity(
    cartId: string,
    buyerIdentity: CartBuyerIdentityInput,
    pagination: CartPagination = { first: 100 },
  ): Promise<CartLinesResponse | null> {
    const response = await storefrontSdk('no-store').cartBuyerIdentityUpdate({
      cartId,
      buyerIdentity,
      ...adjustPaginationVariables({
        after: pagination.after,
        before: pagination.before,
        first: pagination.first ?? 100,
        last: pagination.last,
      }),
    });

    return response?.cartBuyerIdentityUpdate || null;
  }

  static revalidate(): void {
    revalidatePath(config.routes.cart);
  }
}
