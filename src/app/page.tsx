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
import { CREATE_HOW_IT_WORKS, GALLERY_ITEMS } from '@/ui/content/marketing';
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
        <div className="w-full max-w-6xl mx-auto">
          <BeforeAfterPreview
            showStyleSelector
            caption="Drag the slider to reveal the transformation. Choose a style to see different artistic interpretations."
            priority
            aspectClassName="aspect-[21/9]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
          />
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
    </div>
  );
};

export default Home;
