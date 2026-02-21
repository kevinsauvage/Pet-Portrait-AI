import type { Product } from '@/modules/products/models';
import { storefrontSdk } from '@/modules/shopify/api';
import { ShopifyProductRepository } from '@/modules/shopify/repositories/product.repository';

const productRepo = new ShopifyProductRepository();

export const ShopifyStorefrontService = {
  async getProducts(first = 8, sortKey?: string): Promise<Product[]> {
    return productRepo.findAll(first, sortKey);
  },

  async getProductByHandle(handle: string): Promise<Product | null> {
    return productRepo.findByHandle(handle);
  },

  getStorefrontSdk: storefrontSdk,
};
