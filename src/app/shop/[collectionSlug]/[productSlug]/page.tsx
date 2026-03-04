import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';

import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { generateBreadcrumbSchema, generateProductSchema } from '@/core/utils/structured-data';
import {
  getProductDetails,
  getProductSeo,
} from '@/domains/products/services/product-details.service';
import ProductDescription from '@/ui/components/product/ProductDescription';
import ProductRecommendations from '@/ui/components/product/ProductRecommendations';
import HomeSection from '@/ui/components/shared/HomeSection';

export const revalidate = 3600;

type ParametersType = {
  collectionSlug: string;
  productSlug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<ParametersType>;
}): Promise<Metadata> {
  const { collectionSlug, productSlug } = await params;

  const seo = await getProductSeo(productSlug);
  if (!seo) {
    return generateMetadataUtil({
      title: 'Product Not Found',
      description: 'Product not found',
      url: `/shop/${collectionSlug}/${productSlug}`,
      noindex: true,
    });
  }

  return generateMetadataUtil({
    title: seo.title,
    description: seo.description,
    image: seo.image,
    url: `/shop/${collectionSlug}/${productSlug}`,
    type: 'website',
  });
}

type PageProperties = {
  params: Promise<ParametersType>;
};

const ProductPage = async ({ params }: PageProperties) => {
  const { collectionSlug, productSlug } = await params;

  const { product, recommendations } = await getProductDetails(productSlug);

  if (!product) {
    notFound();
  }

  const title = product?.title;
  const hasRecommendations =
    recommendations?.productRecommendations && recommendations.productRecommendations.length > 0;

  const productSchema = generateProductSchema(product, `/shop/${collectionSlug}/${productSlug}`);

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    {
      name: collectionSlug.replace(/-/g, ' '),
      url: `/shop/${collectionSlug}`,
    },
    { name: title || 'Product', url: `/shop/${collectionSlug}/${productSlug}` },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      {/* Structured Data */}
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="min-h-[calc(100vh-76px)]">
        <section className="container mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-8 md:pb-12">
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
    </>
  );
};

export default ProductPage;
