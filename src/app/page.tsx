import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { AI_ART_STYLES } from '@/domains/ai/ai-portrait/types';
import { getHomePageData } from '@/domains/home/services/home.service';
import CollectionGrid from '@/ui/components/catalog/CollectionGrid';
import StylePreview from '@/ui/components/create/StylePreview';
import BeforeAfterPreview from '@/ui/components/media/BeforeAfterPreview';
import GalleryGrid from '@/ui/components/media/GalleryGrid';
import ProductSection from '@/ui/components/product/ProductSection';
import HomeSection from '@/ui/components/shared/HomeSection';
import HowItWorks from '@/ui/components/shared/HowItWorks';
import PageBanner from '@/ui/components/shared/PageBanner';
import {
  CREATE_HOW_IT_WORKS,
  GALLERY_ITEMS,
  HOME_HERO_PERKS,
  TRANSFORMATION_SAMPLE,
} from '@/ui/content/marketing';
import { Button } from '@/ui/primitives/button';

export const revalidate = 3600;

export const metadata: Metadata = generateMetadataUtil({
  title: seo.home.title,
  description: seo.home.description,
  url: '/',
});

const FEATURED_STYLES = AI_ART_STYLES.slice(0, 6);
const GALLERY_PREVIEW = GALLERY_ITEMS.slice(0, 6);

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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] text-left">
          <BeforeAfterPreview
            before={TRANSFORMATION_SAMPLE.before}
            after={TRANSFORMATION_SAMPLE.after}
            caption={TRANSFORMATION_SAMPLE.caption}
            priority
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4">
            {HOME_HERO_PERKS.map((perk) => (
              <div
                key={perk.label}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-primary/10"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <perk.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </span>
                <span className="text-body-sm font-medium text-foreground">{perk.label}</span>
              </div>
            ))}
          </div>
        </div>
      </PageBanner>

      <HowItWorks
        id="home-how-it-works"
        title="Create a portrait in minutes"
        description="Upload a photo, pick a style, review your AI options, and checkout."
        steps={CREATE_HOW_IT_WORKS}
        className="bg-card"
      />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <HomeSection
            id="featured-styles"
            title="Pick a Signature Style"
            description="Explore eight artistic directions that bring out your pet's personality. Start with our most-loved styles."
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href={config.routes.styles}>View all styles</Link>
              </Button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {FEATURED_STYLES.map((style, index) => (
                <StylePreview key={style.id} style={style} index={index} />
              ))}
            </div>
          </HomeSection>
        </div>
      </section>

      {featuredCollections.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <HomeSection
              id="featured-collections"
              title="Explore Our Collections"
              description="A curated selection of signature styles, limited editions, and seasonal drops."
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href={config.routes.collection}>Shop all collections</Link>
                </Button>
              }
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

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <HomeSection
            id="gallery-preview"
            title="From Our Community Gallery"
            description="A quick look at the portraits pet parents are loving right now."
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href={config.routes.gallery}>Explore the full gallery</Link>
              </Button>
            }
          >
            <GalleryGrid items={GALLERY_PREVIEW} ariaLabel="Featured pet portraits" />
          </HomeSection>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-linear-to-b from-secondary/10 via-background to-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/90 p-10 md:p-14 text-center shadow-lg backdrop-blur-sm">
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
