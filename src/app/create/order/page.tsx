import type { Metadata } from 'next';

import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getDefaultAiPortraitProduct } from '@/domains/ai/ai-portrait/get-ai-portrait-product.service';
import { CartService } from '@/domains/cart/services/cart.service';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';
import SavedPortraitsList from '@/ui/components/account/SavedPortraitsList';
import AddMoreProductsActions from '@/ui/components/cart/AddMoreProductsActions';
import CartEmptyState from '@/ui/components/cart/CartEmptyState';
import CartHeader from '@/ui/components/cart/CartHeader';
import CartItemsList from '@/ui/components/cart/CartItemsList';
import CartPromoCode from '@/ui/components/cart/CartPromoCode';
import CartSummary from '@/ui/components/cart/CartSummary';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import OrderBackButton from '@/ui/components/create/OrderBackButton';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import { Card, CardContent } from '@/ui/primitives/card';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataUtil({
    title: seo.cart.title,
    description: seo.cart.description,
    url: '/create/order',
    noindex: true,
  });
}

const OrderPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    artwork?: string;
    photo?: string;
    styleId?: string;
    generationId?: string;
    urls?: string;
  }>;
}) => {
  const { artwork, photo, styleId, generationId, urls } = await searchParams;
  const [cartId, savedPortraits, defaultProduct] = await Promise.all([
    CartService.getCartId(),
    WishlistService.getWishlist(),
    getDefaultAiPortraitProduct(),
  ]);
  const cart = cartId ? await CartService.getCart(cartId) : null;
  const isEmpty = !cart?.lines?.edges || cart.lines.edges.length === 0;

  return (
    <div className="space-y-8">
      <CreateProgressBar currentStep="product" />

      <div className="space-y-6">
        <OrderBackButton
          artwork={artwork}
          photo={photo}
          styleId={styleId}
          generationId={generationId}
          urls={urls}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-heading-2">Your Cart</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Review your order, apply discounts, and complete your purchase.
            </p>
          </div>
          {!isEmpty && <CartHeader />}
        </div>

        <AddMoreProductsActions
          artwork={artwork}
          photo={photo}
          styleId={styleId}
          generationId={generationId}
          urls={urls}
        />

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

        {savedPortraits.length > 0 && (
          <section className="mt-6">
            <Card>
              <CardHeaderPattern
                title={`Saved for later (${savedPortraits.length})`}
                size={4}
                as="h2"
                description={
                  savedPortraits.length === 1
                    ? 'You have 1 portrait saved for later. Tap it to add it back to your cart.'
                    : `You have ${savedPortraits.length} portraits saved for later. Tap any portrait to add it back to your cart.`
                }
              />
              <CardContent className="pt-0">
                <SavedPortraitsList
                  portraits={savedPortraits}
                  defaultProduct={
                    defaultProduct
                      ? {
                          product: {
                            handle: defaultProduct.product.handle,
                            gelatoProductUid: defaultProduct.product.gelatoProductUid,
                          },
                          variant: defaultProduct.variant,
                        }
                      : null
                  }
                />
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
