import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import HomeSection from '@/app/_components/HomeSection';
import { storefrontSdk } from '@/infra/shopify/client';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import ProductDescription from '@/ui/components/ProductDescription';
import ProductRecommendations from '@/ui/components/ProductRecommendations';

export const revalidate = 3600;

const getProductByHandle = cache(async (handle: string) => {
  return storefrontSdk().getProductByHandle({
    handle,
    identifiers: [],
  });
});

type parametersType = {
  genre: string;
  collectionSlug: string;
  productSlug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<parametersType>;
}): Promise<Metadata> {
  const { productSlug } = await params;

  const { product } = await getProductByHandle(productSlug);

  if (!product) {
    return generateMetadataUtil({
      title: 'Product Not Found',
      description: 'Product not found',
      url: `/shop/products/${productSlug}`,
      noindex: true,
    });
  }

  const title = product.seo?.title || product.title || 'Product';
  const description =
    product.seo?.description ||
    product.descriptionHtml
      ?.replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() ||
    'Product';

  return generateMetadataUtil({
    title,
    description,
    url: `/shop/products/${productSlug}`,
    type: 'website',
  });
}

type PageProperties = {
  params: Promise<parametersType>;
};

const ProductPage = async ({ params }: PageProperties) => {
  const parameters = await params;

  const { product } = await getProductByHandle(parameters.productSlug);

  if (!product) {
    notFound();
  }

  const recommendations = await storefrontSdk().productRecommendations({
    identifiers: [],
    productId: product.id,
  });

  const title = product?.title;
  const hasRecommendations =
    recommendations?.productRecommendations && recommendations.productRecommendations.length > 0;

  return (
    <div className="min-h-[calc(100vh-76px)]">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <Breadcrumbs lastElement={title} />
      </div>

      <section className="container mx-auto px-4 md:px-6 pb-8 md:pb-12">
        <ProductDescription product={product} isModal={false} />
      </section>

      {hasRecommendations && (
        <section className="container mx-auto px-4 md:px-6 pb-12 md:pb-16">
          <HomeSection title="Recommended Products">
            <ProductRecommendations recommendations={recommendations} />
          </HomeSection>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
