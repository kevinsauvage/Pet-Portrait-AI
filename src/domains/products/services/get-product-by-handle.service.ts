import type { Product } from '@/domains/products/models';
import { ShopifyProductRepository } from '@/infra/shopify/repositories/product.repository';

const productRepo = new ShopifyProductRepository();

export const GetProductByHandleService = {
  async execute(handle: string): Promise<Product | null> {
    return productRepo.findByHandle(handle);
  },
};
