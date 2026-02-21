import type { Metadata } from 'next';

import seo from '@/data/seo';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import { storefrontSdk } from '@/modules/shopify';
import { CollectionSortKeys, ProductSortKeys } from '@/modules/shopify/storefront/index';
import CollectionGrid from '@/ui/components/CollectionGrid/CollectionGrid';
import PageBanner from '@/ui/components/PageBanner';

import HomeSection from './_components/HomeSection';
import ProductSection from './_components/ProductSection';

import { Camera, Palette, Truck } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = generateMetadataUtil({
  title: seo.home.title,
  description: seo.home.description,
  url: '/',
});

const FEATURES = [
  {
    icon: Camera,
    title: 'Upload a Photo',
    description: 'Snap a picture of your furry friend or choose from your gallery.',
  },
  {
    icon: Palette,
    title: 'Pick a Style',
    description: 'Renaissance, watercolor, pop art — over 20 artistic styles to choose from.',
  },
  {
    icon: Truck,
    title: 'Get It Delivered',
    description: 'Printed on premium canvas or poster, shipped free to your door.',
  },
] as const;

const Home = async () => {
  const [collections, bestSelling, newArrival] = await Promise.all([
    storefrontSdk().collections({
      first: 100,
      firstProducts: 1,
      identifiers: [{ key: 'featured', namespace: 'custom' }],
      sortKey: CollectionSortKeys?.Relevance,
    }),
    storefrontSdk().getProducts({
      first: 8,
      identifiers: [],
      sortKey: ProductSortKeys.BestSelling,
    }),
    storefrontSdk().getProducts({
      first: 8,
      identifiers: [],
      sortKey: ProductSortKeys.CreatedAt,
    }),
  ]);

  const featuredCollections = collections.collections.edges.filter((collection) =>
    collection.node.metafields.find((metafield) => metafield?.key === 'featured'),
  );

  const bestSellingProducts = bestSelling.products.edges.map((edge) => edge.node);
  const newArrivalProducts = newArrival.products.edges.map((edge) => edge.node);

  return (
    <div className="space-y-0">
      <PageBanner
        title="Turn Your Pet Into a Masterpiece"
        description="Upload a photo. Choose a style. Get a stunning AI-generated portrait — printed on premium canvas, poster, or as a digital download."
        ctaLabel="Create Your Portrait"
        ctaHref="/create"
        secondaryCtaLabel="Browse Gallery"
        secondaryCtaHref="/gallery"
      />

      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-heading-2">How It Works</h2>
            <p className="text-body-lg text-secondary max-w-xl mx-auto mt-2">
              Three simple steps to a portrait your pet deserves.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
            {FEATURES.map((feature, index) => (
              <div key={feature.title} className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <p className="text-caption-sm text-primary font-semibold">Step {index + 1}</p>
                  <h3 className="text-heading-4">{feature.title}</h3>
                  <p className="text-body-sm text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredCollections.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <HomeSection title="Explore Our Collections">
              <CollectionGrid collections={featuredCollections} />
            </HomeSection>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 md:px-6 space-y-16 md:space-y-24 py-16 md:py-24">
        {bestSellingProducts.length > 0 && (
          <ProductSection
            title="Most Loved Portraits"
            products={bestSellingProducts}
            viewAllLabel="View all portraits"
          />
        )}

        {newArrivalProducts.length > 0 && (
          <ProductSection
            title="Fresh Off the Easel"
            products={newArrivalProducts}
            viewAllLabel="See new arrivals"
          />
        )}
      </div>

      <section className="py-16 md:py-24 bg-linear-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
          <h2 className="text-heading-2 mb-4">Ready to Create?</h2>
          <p className="text-body-lg text-secondary mb-8">
            Join thousands of pet owners who have turned their beloved companions into timeless art.
          </p>
          <a
            href="/create"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:opacity-90"
          >
            Start Your Portrait
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
