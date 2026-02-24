import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import config from '@/core/config';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import {
  getProductDetails,
  getProductSeo,
} from '@/domains/products/services/product-details.service';
import Breadcrumbs from '@/ui/components/navigation/Breadcrumbs';
import ProductDescription from '@/ui/components/product/ProductDescription';
import ProductRecommendations from '@/ui/components/product/ProductRecommendations';
import HomeSection from '@/ui/components/shared/HomeSection';

export const revalidate = config.constants.revalidate.product;

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

  const seo = await getProductSeo(productSlug);
  if (!seo) {
    return generateMetadataUtil({
      title: 'Product Not Found',
      description: 'Product not found',
      url: `/shop/products/${productSlug}`,
      noindex: true,
    });
  }

  return generateMetadataUtil({
    title: seo.title,
    description: seo.description,
    url: `/shop/products/${productSlug}`,
    type: 'website',
  });
}

type PageProperties = {
  params: Promise<parametersType>;
};

const ProductPage = async ({ params }: PageProperties) => {
  const parameters = await params;

  const { product, recommendations } = await getProductDetails(parameters.productSlug);

  if (!product) {
    notFound();
  }

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
