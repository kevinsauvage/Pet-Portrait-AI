import type { Product } from '@/modules/products/models';
import { ShopifyProductRepository } from '@/modules/shopify/repositories/product.repository';

const productRepo = new ShopifyProductRepository();

export const GetProductByHandleService = {
  async execute(handle: string): Promise<Product | null> {
    return productRepo.findByHandle(handle);
  },
};
