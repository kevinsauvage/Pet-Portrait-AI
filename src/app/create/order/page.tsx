import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getAiPortraitProductByHandle } from '@/domains/ai/ai-portrait/get-ai-portrait-product.service';
import type { CreateFlowParams } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { getFirstAvailableVariant } from '@/domains/ai/ai-portrait/utils/product-utils';
import { validateAndRedirect } from '@/domains/ai/ai-portrait/utils/validate-create-flow-step';
import { isArtworkUrlHostnameAllowed } from '@/domains/printful/allowed-artwork-url';
import { generatePreview } from '@/domains/printful/preview.service';
import AddMoreProductsActions from '@/ui/components/cart/AddMoreProductsActions';
import CreateFlowArtworkPreview from '@/ui/components/create/CreateFlowArtworkPreview';
import CreateFlowBackButton from '@/ui/components/create/CreateFlowBackButton';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import AddToCartIsland from '@/ui/components/create/islands/AddToCartIsland';
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

interface CreateOrderPageProps {
  searchParams: Promise<CreateFlowParams & { productHandle?: string }>;
}

export default async function CreateOrderPage({ searchParams }: CreateOrderPageProps) {
  const params = await searchParams;
  const { artwork, photo, styleId, generationId, productHandle, urls, previewUrl } = params;

  // Validate and redirect if needed
  validateAndRedirect('order', params);

  // After validation, we know artwork and productHandle are defined
  if (!artwork || !productHandle) {
    notFound();
  }

  const product = await getAiPortraitProductByHandle(productHandle);
  if (!product || product.variants.length === 0) {
    notFound();
  }

  const firstVariant = getFirstAvailableVariant(product.variants) ?? product.variants[0];
  const serverPreview =
    firstVariant?.printfulVariantId &&
    artwork &&
    isArtworkUrlHostnameAllowed(artwork)
      ? await generatePreview({
          variantId: firstVariant.printfulVariantId,
          artworkUrl: artwork,
        })
      : null;

  return (
    <div className="relative">
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mx-auto  space-y-8">
          <CreateProgressBar currentStep="product" />
          <CreateFlowBackButton
            target="collections"
            artwork={artwork}
            photo={photo}
            styleId={styleId}
            generationId={generationId}
            urls={urls}
          />

          <div className="flex items-start gap-6">
            {artwork && <CreateFlowArtworkPreview artwork={artwork} size="md" />}
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
                photo={photo}
                styleId={styleId}
                generationId={generationId}
                urls={urls}
                initialPreviewUrl={previewUrl ?? serverPreview?.previewUrl ?? undefined}
                initialPreviewVariantId={
                  !previewUrl && serverPreview?.previewUrl ? firstVariant?.id : undefined
                }
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
