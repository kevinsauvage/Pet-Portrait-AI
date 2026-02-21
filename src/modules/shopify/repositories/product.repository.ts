import type { Product } from '@/modules/products/models';
import { storefrontSdk } from '@/modules/shopify/api';
import { mapShopifyProductToDomain } from '@/modules/shopify/mappers/product-mapper';
import type { ProductSortKeys } from '@/modules/shopify/storefront';

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
