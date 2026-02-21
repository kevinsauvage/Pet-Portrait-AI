import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import config from '@/core/config';
import { storefrontSdk } from '@/modules/shopify/api';
import { adjustPaginationVariables } from '@/modules/shopify/helpers';
import type { CartFieldsFragment } from '@/modules/shopify/storefront';
import { mapShopifyUserErrors, safeLogError } from '@/utils/api-responses';
import { getSecureCookieOptions } from '@/utils/cookie-security';

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

  static revalidate(): void {
    revalidatePath(config.routes.cart);
  }
}
