import { revalidatePath } from 'next/cache';

import config from '@/core/config';
import { logger } from '@/core/utils/logger';
import { adminSdk, storefrontSdk } from '@/infra/shopify/client';
import { getShopifyToken } from '@/infra/shopify/server';
import type { ProductFieldsFragment } from '@/infra/shopify/storefront';

export const WISHLIST_MAX_ITEMS = 100;

export type WishlistIds = string[];

export class WishlistService {
  static async requireAuth(): Promise<string> {
    const shopifyToken = await getShopifyToken();
    if (!shopifyToken) {
      throw new Error('User not authenticated');
    }
    return shopifyToken;
  }

  static async getWishlistIds(): Promise<WishlistIds> {
    const shopifyToken = await getShopifyToken();

    if (!shopifyToken) return [];

    const wishlistResponse = await storefrontSdk('no-store').getCustomerMetafields({
      customerAccessToken: shopifyToken,
      metafields: [{ key: 'wishlist', namespace: 'custom' }],
    });

    const metafields = wishlistResponse?.customer?.metafields;
    const wishlistValue = metafields?.[0]?.value;

    if (typeof wishlistValue === 'string') {
      try {
        const parsed = JSON.parse(wishlistValue);

        if (Array.isArray(parsed)) {
          return parsed.filter((id): id is string => typeof id === 'string');
        }
      } catch (error) {
        logger.error('Failed to parse wishlist IDs', { context: 'WishlistService.getWishlistIds', error });
        return [];
      }
    }

    return [];
  }

  private static async resolveProductsByIds(
    productIds: string[],
  ): Promise<ProductFieldsFragment[]> {
    if (productIds.length === 0) return [];

    try {
      const response = await storefrontSdk('no-store').getProductsByIds({
        ids: productIds,
        identifiers: [],
      });

      if (!response.nodes || response.nodes.length === 0) {
        return [];
      }

      const productMap = new Map(
        response.nodes
          .filter((node) => node !== null && node !== undefined)
          .map((node) => {
            const product = node as unknown as ProductFieldsFragment;
            return [product.id, product] as [string, ProductFieldsFragment];
          }),
      );

      return productIds
        .map((id) => productMap.get(id))
        .filter((p): p is ProductFieldsFragment => p !== undefined);
    } catch (error) {
      logger.error('Failed to resolve products by IDs', { context: 'WishlistService.resolveProductsByIds', error });
      return [];
    }
  }

  static async getWishlist(): Promise<ProductFieldsFragment[]> {
    const productIds = await this.getWishlistIds();
    return this.resolveProductsByIds(productIds);
  }

  private static createWishlistMetafields(productIds: WishlistIds, userId: string) {
    const limitedIds = productIds.slice(0, WISHLIST_MAX_ITEMS);

    return {
      metafields: [
        {
          key: 'wishlist',
          namespace: 'custom',
          ownerId: userId,
          type: 'json',
          value: JSON.stringify(limitedIds),
        },
      ],
    };
  }

  static async updateWishlist(
    productIds: WishlistIds,
    userId: string,
  ): Promise<{ success: boolean; data?: WishlistIds; message?: string }> {
    const limitedIds = productIds.slice(0, WISHLIST_MAX_ITEMS);
    const uniqueIds = Array.from(new Set(limitedIds));

    const { metafields } = this.createWishlistMetafields(uniqueIds, userId);

    const responseMetafield = await adminSdk().MetafieldsSet({ metafields });
    const errors = responseMetafield?.metafieldsSet?.userErrors;

    if (errors && errors.length > 0) {
      logger.error('MetafieldsSet errors when updating wishlist', { context: 'WishlistService.updateWishlist', metadata: { errors } });
      return {
        success: false,
        message: 'Something went wrong updating the wishlist',
      };
    }

    const value = responseMetafield?.metafieldsSet?.metafields?.filter(
      (field) => field.key === 'wishlist',
    )?.[0]?.value;

    if (value) {
      try {
        const parsed = JSON.parse(value) as WishlistIds;
        this.revalidate();
        return {
          success: true,
          data: parsed,
        };
      } catch (error) {
        logger.error('Failed to parse wishlist response', { context: 'WishlistService.updateWishlist', error });
        return {
          success: false,
          message: "Couldn't parse wishlist response",
        };
      }
    }

    return {
      success: false,
      message: "Couldn't update user wishlist",
    };
  }

  static async addProduct(productId: string, userId: string) {
    const currentIds = await this.getWishlistIds();

    if (currentIds.includes(productId)) {
      return { success: true, data: currentIds, message: 'Product already in wishlist' };
    }

    const newIds = [...currentIds, productId];
    return this.updateWishlist(newIds, userId);
  }

  static async removeProduct(productId: string, userId: string) {
    const currentIds = await this.getWishlistIds();
    const newIds = currentIds.filter((id) => id !== productId);

    if (currentIds.length === newIds.length) {
      return {
        success: false,
        message: 'Product not found in wishlist',
      };
    }

    return this.updateWishlist(newIds, userId);
  }

  static async addProductWithValidation(productId: string, userId: string) {
    const currentIds = await this.getWishlistIds();

    if (currentIds.includes(productId)) {
      return {
        success: false,
        reason: 'duplicate',
        message: 'Product already in wishlist',
      } as const;
    }

    if (currentIds.length >= WISHLIST_MAX_ITEMS) {
      return {
        success: false,
        reason: 'max',
        message: `Wishlist is full. Maximum ${WISHLIST_MAX_ITEMS} items allowed.`,
      } as const;
    }

    const result = await this.addProduct(productId, userId);

    if (!result.success || result.data === undefined) {
      return {
        success: false,
        reason: 'update_failed',
        message: result.message || "Couldn't add product to user wishlist",
      } as const;
    }

    return {
      success: true,
      wishlistIds: result.data,
      message: 'Product correctly added to wishlist',
    } as const;
  }

  static revalidate(): void {
    revalidatePath(config.routes.wishlist);
    revalidatePath('/', 'layout');
  }
}
