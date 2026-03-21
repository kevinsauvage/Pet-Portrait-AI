import { revalidatePath } from 'next/cache';

import config from '@/core/config';
import { logger } from '@/core/utils/logger.server';
import { adminSdk, storefrontSdk } from '@/infra/shopify/client';
import { getShopifyToken } from '@/infra/shopify/server';

import type { SavedPortrait, WishlistData } from './types';
import { parseWishlistMetafieldJson, WISHLIST_MAX_ITEMS } from './validation';

export { WISHLIST_MAX_ITEMS };

export class WishlistService {
  static async requireAuth(): Promise<string> {
    const shopifyToken = await getShopifyToken();
    if (!shopifyToken) {
      throw new Error('User not authenticated');
    }
    return shopifyToken;
  }

  static async getWishlist(): Promise<WishlistData> {
    const shopifyToken = await getShopifyToken();

    if (!shopifyToken) return [];

    const wishlistResponse = await storefrontSdk('no-store').getCustomerMetafields({
      customerAccessToken: shopifyToken,
      metafields: [{ key: 'portrait_wishlist', namespace: 'custom' }],
    });

    const metafields = wishlistResponse?.customer?.metafields;
    const wishlistValue = metafields?.[0]?.value;

    if (typeof wishlistValue === 'string') {
      try {
        const parsed: unknown = JSON.parse(wishlistValue);
        return parseWishlistMetafieldJson(parsed);
      } catch (error) {
        logger.error('Failed to parse portrait wishlist', {
          context: 'WishlistService.getWishlist',
          error,
        });
        return [];
      }
    }

    return [];
  }

  private static createWishlistMetafields(portraits: WishlistData, userId: string) {
    const limited = portraits.slice(0, WISHLIST_MAX_ITEMS);

    return {
      metafields: [
        {
          key: 'portrait_wishlist',
          namespace: 'custom',
          ownerId: userId,
          type: 'json',
          value: JSON.stringify(limited),
        },
      ],
    };
  }

  static async updateWishlist(
    portraits: WishlistData,
    userId: string,
  ): Promise<{ success: boolean; data?: WishlistData; message?: string }> {
    const limited = portraits.slice(0, WISHLIST_MAX_ITEMS);
    const unique = Array.from(new Map(limited.map((p) => [p.id, p])).values());

    const { metafields } = this.createWishlistMetafields(unique, userId);

    const responseMetafield = await adminSdk().MetafieldsSet({ metafields });
    const errors = responseMetafield?.metafieldsSet?.userErrors;

    if (errors && errors.length > 0) {
      logger.error('MetafieldsSet errors when updating portrait wishlist', {
        context: 'WishlistService.updateWishlist',
        metadata: { errors },
      });
      return {
        success: false,
        message: 'Something went wrong updating your saved portraits',
      };
    }

    const value = responseMetafield?.metafieldsSet?.metafields?.filter(
      (field) => field.key === 'portrait_wishlist',
    )?.[0]?.value;

    if (value) {
      try {
        const parsed: unknown = JSON.parse(value);
        const data = parseWishlistMetafieldJson(parsed);
        this.revalidate();
        return { success: true, data };
      } catch (error) {
        logger.error('Failed to parse portrait wishlist response', {
          context: 'WishlistService.updateWishlist',
          error,
        });
        return { success: false, message: "Couldn't parse saved portraits response" };
      }
    }

    return { success: false, message: "Couldn't update saved portraits" };
  }

  static async addPortrait(portrait: Omit<SavedPortrait, 'id' | 'savedAt'>, userId: string) {
    const current = await this.getWishlist();

    const alreadySaved = current.some(
      (p) => p.imageUrl === portrait.imageUrl || p.generationId === portrait.generationId,
    );

    if (alreadySaved) {
      return {
        success: false,
        reason: 'duplicate' as const,
        message: 'Portrait already saved to favourites',
      };
    }

    if (current.length >= WISHLIST_MAX_ITEMS) {
      return {
        success: false,
        reason: 'max' as const,
        message: `Favourites is full. Maximum ${WISHLIST_MAX_ITEMS} portraits allowed.`,
      };
    }

    const newPortrait: SavedPortrait = {
      ...portrait,
      id: `${portrait.generationId}-${Date.now()}`,
      savedAt: new Date().toISOString(),
    };

    const result = await this.updateWishlist([...current, newPortrait], userId);

    if (!result.success || result.data === undefined) {
      return {
        success: false,
        reason: 'update_failed' as const,
        message: result.message || "Couldn't save portrait to favourites",
      };
    }

    return {
      success: true as const,
      data: result.data,
      message: 'Portrait saved to favourites',
    };
  }

  static async removePortrait(portraitId: string, userId: string) {
    const current = await this.getWishlist();
    const updated = current.filter((p) => p.id !== portraitId);

    if (current.length === updated.length) {
      return { success: false, message: 'Portrait not found in favourites' };
    }

    return this.updateWishlist(updated, userId);
  }

  static async getWishlistCount(): Promise<number> {
    const wishlist = await this.getWishlist();
    return wishlist.length;
  }

  static revalidate(): void {
    revalidatePath(config.routes.wishlist);
    revalidatePath(config.routes.creations);
    revalidatePath('/', 'layout');
  }
}
