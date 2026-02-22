import { mapShopifyProductToDomain } from '@/domains/products/mappers/product-mapper';
import type { Product } from '@/domains/products/models';
import { storefrontSdk } from '@/infra/shopify/client';
import type { ProductSortKeys } from '@/infra/shopify/storefront';

export class ShopifyProductRepository {
  async findAll(first = 8, sortKey?: string): Promise<Product[]> {
    const result = await storefrontSdk().getProducts({
      first,
      identifiers: [],
      sortKey: sortKey as ProductSortKeys | undefined,
    });

    return result.products.edges.map((edge) => mapShopifyProductToDomain(edge.node));
  }

  async findByHandle(handle: string): Promise<Product | null> {
    const result = await storefrontSdk().getProductByHandle({
      handle,
      identifiers: [],
    });
    if (!result.product) return null;

    return mapShopifyProductToDomain(result.product);
  }
}
