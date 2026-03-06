import { mapShopifyProductToDomain } from '@/domains/products/mappers/product-mapper';
import type { Product } from '@/domains/products/models';
import { withCache } from '@/infra/cache';
import { storefrontSdk } from '@/infra/shopify/client';
import type { ProductSortKeys } from '@/infra/shopify/generated/storefront/index';

export class ShopifyProductRepository {
  private cachedFindAll = withCache(
    async (first: number = 8, sortKey: string | undefined = undefined): Promise<Product[]> => {
      const result = await storefrontSdk().getProducts({
        first,
        identifiers: [],
        sortKey: sortKey as ProductSortKeys | undefined,
      });

      return result.products.edges.map((edge) => mapShopifyProductToDomain(edge.node));
    },
    {
      prefix: 'products:all',
      ttlMs: 3600000,
    },
  );

  private cachedFindByHandle = withCache(
    async (handle: string): Promise<Product | null> => {
      const result = await storefrontSdk().getProductByHandle({
        handle,
        identifiers: [],
      });
      if (!result.product) return null;

      return mapShopifyProductToDomain(result.product);
    },
    {
      prefix: 'products:handle',
      ttlMs: 3600000,
    },
  );

  async findAll(first = 8, sortKey?: string): Promise<Product[]> {
    return this.cachedFindAll(first, sortKey);
  }

  async findByHandle(handle: string): Promise<Product | null> {
    return this.cachedFindByHandle(handle);
  }
}
