import type { Metadata } from 'next';

import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { CartService } from '@/domains/cart/cart.service';
import CartEmptyState from '@/ui/components/cart/CartEmptyState';
import CartHeader from '@/ui/components/cart/CartHeader';
import CartItemsList from '@/ui/components/cart/CartItemsList';
import CartPromoCode from '@/ui/components/cart/CartPromoCode';
import CartSummary from '@/ui/components/cart/CartSummary';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataUtil({
    title: seo.cart.title,
    description: seo.cart.description,
    url: '/order',
    noindex: true,
  });
}

const OrderPage = async () => {
  const cartId = await CartService.getCartId();
  let cart = null;
  if (cartId) {
    try {
      cart = await CartService.getCart(cartId);
    } catch {
      cart = null;
    }
  }
  const isEmpty = !cart?.lines?.edges || cart.lines.edges.length === 0;

  return (
    <div className="relative">
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-heading-2">Your Cart</h1>
                <p className="text-body-sm text-muted-foreground mt-1">
                  Review your order, apply discounts, and complete your purchase.
                </p>
              </div>
              {!isEmpty && <CartHeader />}
            </div>

            {isEmpty ? (
              <CartEmptyState />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <CartItemsList />
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <CartSummary />
                  <CartPromoCode />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
