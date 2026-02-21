'use server';

import { CartService } from '@/modules/cart';
import type { CartFieldsFragment } from '@/modules/shopify/storefront';

export async function createCartAction(): Promise<CartFieldsFragment> {
  return CartService.createCart();
}
