import { logger } from '@/core/utils/logger';
import { adminSdk, storefrontSdk } from '@/infra/shopify/client';
import { getShopifyToken } from '@/infra/shopify/server';

export const CREATIONS_MAX_ITEMS = 100;

export type UserCreation = {
  id: string;
  originalPhotoUrl: string;
  generatedUrls: string[];
  styleId: string;
  generationId: string;
  createdAt: string;
};

export type UserCreationsData = UserCreation[];

export class CreationsService {
  static async getCreations(): Promise<UserCreationsData> {
    const shopifyToken = await getShopifyToken();

    if (!shopifyToken) return [];

    const response = await storefrontSdk('no-store').getCustomerMetafields({
      customerAccessToken: shopifyToken,
      metafields: [{ key: 'user_creations', namespace: 'custom' }],
    });

    const metafields = response?.customer?.metafields;
    const value = metafields?.[0]?.value;

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is UserCreation =>
              typeof item === 'object' && item !== null && typeof item.id === 'string',
          );
        }
      } catch (error) {
        logger.error('Failed to parse user creations', {
          context: 'CreationsService.getCreations',
          error,
        });
        return [];
      }
    }

    return [];
  }

  static async addCreation(
    creation: Omit<UserCreation, 'id' | 'createdAt'>,
    userId: string,
  ): Promise<{ success: boolean; message?: string }> {
    const current = await this.getCreations();

    const exists = current.some((c) => c.generationId === creation.generationId);
    if (exists) {
      return { success: true, message: 'Creation already logged' };
    }

    const newEntry: UserCreation = {
      ...creation,
      id: `${creation.generationId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...current].slice(0, CREATIONS_MAX_ITEMS);

    const metafields = [
      {
        key: 'user_creations',
        namespace: 'custom',
        ownerId: userId,
        type: 'json',
        value: JSON.stringify(updated),
      },
    ];

    const responseMetafield = await adminSdk().MetafieldsSet({ metafields });
    const errors = responseMetafield?.metafieldsSet?.userErrors;

    if (errors && errors.length > 0) {
      logger.error('MetafieldsSet errors when saving creation', {
        context: 'CreationsService.addCreation',
        metadata: { errors },
      });
      return { success: false, message: 'Something went wrong saving your creation' };
    }

    return { success: true, message: 'Creation saved' };
  }

  static async getCreationsCount(): Promise<number> {
    const creations = await this.getCreations();
    return creations.length;
  }
}
