import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { getHomePageData } from '@/domains/home/services/home.service';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import CollectionGrid from '@/ui/components/catalog/CollectionGrid';
import ProductSection from '@/ui/components/product/ProductSection';
import HomeSection from '@/ui/components/shared/HomeSection';
import PageBanner from '@/ui/components/shared/PageBanner';
import { HOME_FEATURES, HOME_HERO_PERKS } from '@/ui/content/marketing';
import { Button } from '@/ui/primitives/button';

export const revalidate = config.constants.revalidate.catalog;

export const metadata: Metadata = generateMetadataUtil({
  title: seo.home.title,
  description: seo.home.description,
  url: '/',
});

const Home = async () => {
  const { featuredCollections, bestSellingProducts, newArrivalProducts } = await getHomePageData();

  return (
    <div className="space-y-0">
      <PageBanner
        eyebrow="AI Pet Portrait Studio"
        title="Turn Your Pet Into a Masterpiece"
        description="Upload a photo. Choose a style. Get a stunning AI-generated portrait — printed on premium canvas, poster, or as a digital download."
        ctaLabel="Create Your Portrait"
        ctaHref="/create"
        secondaryCtaLabel="Browse Gallery"
        secondaryCtaHref="/gallery"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
          {HOME_HERO_PERKS.map((perk) => (
            <div
              key={perk.label}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <perk.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </span>
              <span className="text-body-sm font-medium text-foreground">{perk.label}</span>
            </div>
          ))}
        </div>
      </PageBanner>

      <section className="py-16 md:py-24 bg-card" aria-labelledby="how-it-works-title">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16 space-y-3">
            <p className="text-caption-sm uppercase tracking-[0.3em] text-muted-foreground">
              How it works
            </p>
            <h2 id="how-it-works-title" className="text-heading-2 tracking-tight">
              Three steps to a portrait you&apos;ll treasure
            </h2>
            <p className="text-body-lg text-secondary max-w-xl mx-auto">
              Seamless from upload to delivery. We handle the details while you enjoy the reveal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {HOME_FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="group flex flex-col items-start text-left space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 md:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <p className="text-caption-sm text-primary font-semibold">Step {index + 1}</p>
                  <h3 className="text-heading-4 tracking-tight">{feature.title}</h3>
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
            <HomeSection
              id="featured-collections"
              title="Explore Our Collections"
              description="A curated selection of signature styles, limited editions, and seasonal drops."
            >
              <CollectionGrid collections={featuredCollections} ariaLabel="Featured collections" />
            </HomeSection>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 md:px-6 space-y-16 md:space-y-24 py-16 md:py-24">
        {bestSellingProducts.length > 0 && (
          <ProductSection
            id="best-selling"
            title="Most Loved Portraits"
            description="Fan favorites that customers reorder for every new pet."
            products={bestSellingProducts}
            viewAllLabel="View all portraits"
          />
        )}

        {newArrivalProducts.length > 0 && (
          <ProductSection
            id="new-arrivals"
            title="Fresh Off the Easel"
            description="New releases, trending styles, and limited drops from the studio."
            products={newArrivalProducts}
            viewAllLabel="See new arrivals"
          />
        )}
      </div>

      <section className="py-16 md:py-24 bg-linear-to-b from-secondary/10 via-background to-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-10 md:p-14 text-center shadow-sm">
            <div
              className="absolute -right-20 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative space-y-6 max-w-2xl mx-auto">
              <h2 className="text-heading-2 tracking-tight">Ready to Create?</h2>
              <p className="text-body-lg text-secondary">
                Join thousands of pet owners who have turned their beloved companions into timeless
                art.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button asChild size="lg" className="px-8 py-6 text-base">
                  <Link href="/create">Start Your Portrait</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 py-6 text-base">
                  <Link href="/gallery">View Gallery</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
