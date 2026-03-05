import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getAiPortraitProductByHandle } from '@/domains/ai/ai-portrait/get-ai-portrait-product.service';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import AddMoreProductsActions from '@/ui/components/cart/AddMoreProductsActions';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import AddToCartIsland from '@/ui/components/create/islands/AddToCartIsland';
import OrderBackButton from '@/ui/components/create/OrderBackButton';
import ProductDescriptionHtml from '@/ui/components/product/ProductDescriptionHtml';
import { Card, CardContent } from '@/ui/primitives/card';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataUtil({
    title: seo.create.order.title,
    description: seo.create.order.description,
    url: '/create/order',
    noindex: true,
  });
}

export default async function CreateOrderPage({
  searchParams,
}: {
  searchParams: Promise<{
    artwork?: string;
    photo?: string;
    styleId?: string;
    generationId?: string;
    productHandle?: string;
    urls?: string;
  }>;
}) {
  const { artwork, photo, styleId, generationId, productHandle, urls } = await searchParams;

  if (!artwork) {
    redirect(config.routes.create);
  }
  if (!productHandle) {
    redirect(
      `${config.routes.createCollections}${buildCreateFlowQueryString({
        artwork,
        photo,
        styleId,
        generationId,
        urls,
      })}`,
    );
  }

  const product = await getAiPortraitProductByHandle(productHandle);
  if (!product || product.variants.length === 0) {
    notFound();
  }

  return (
    <div className="relative">
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mx-auto  space-y-8">
          <CreateProgressBar currentStep="product" />
          <OrderBackButton
            artwork={artwork}
            photo={photo}
            styleId={styleId}
            generationId={generationId}
            urls={urls}
          />

          <div className="flex items-start gap-6">
            {artwork && (
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border shadow-sm">
                <Image
                  src={artwork}
                  alt="Your selected portrait"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-heading-2">{product.title}</h1>
              <p className="text-body-sm text-muted-foreground mt-1">
                Choose size, quantity, and add to cart.
              </p>
              {product.description && (
                <ProductDescriptionHtml html={product.description} className="mt-4" />
              )}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <AddToCartIsland
                product={product}
                artworkUrl={artwork}
                originalPhotoUrl={photo}
                styleId={styleId}
                generationId={generationId}
              />
            </CardContent>
          </Card>

          <AddMoreProductsActions
            artwork={artwork}
            photo={photo}
            styleId={styleId}
            generationId={generationId}
            urls={urls}
          />
        </div>
      </div>
    </div>
  );
}
