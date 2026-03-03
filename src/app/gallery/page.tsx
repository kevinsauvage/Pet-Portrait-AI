import type { Metadata } from 'next';
import Link from 'next/link';

import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import StyleGallery from '@/ui/components/media/StyleGallery';
import PageBanner from '@/ui/components/shared/PageBanner';
import { GALLERY_ITEMS } from '@/ui/content/marketing';
import { Button } from '@/ui/primitives/button';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.gallery.title,
  description: seo.gallery.description,
  url: '/gallery',
});

const GalleryPage = () => {
  return (
    <div>
      <PageBanner
        eyebrow="Community Gallery"
        title="Portrait Gallery"
        description="Inspiration from our community. Browse stunning AI-generated pet portraits across all styles."
        ctaLabel="Create Your Portrait"
        ctaHref="/create"
        secondaryCtaLabel="Browse Styles"
        secondaryCtaHref="/create"
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h2 className="text-heading-3 tracking-tight">Style Gallery</h2>
              <p className="text-body-sm text-muted-foreground max-w-2xl">
                Filter by style and pet type to explore the full range of portraits.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/create">Start creating</Link>
            </Button>
          </div>

          <StyleGallery items={GALLERY_ITEMS} ariaLabel="Featured portraits" />

          <div className="mt-16 md:mt-20">
            <div className="rounded-3xl border border-border/60 bg-card p-10 md:p-12 text-center shadow-sm">
              <h3 className="text-heading-3 tracking-tight mb-3">Ready to see your pet here?</h3>
              <p className="text-body-lg text-secondary max-w-2xl mx-auto mb-6">
                Upload a photo and we&apos;ll create a portrait in your favorite style.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  size="lg"
                  asChild
                  className="px-8 py-6 text-base shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Link href="/create">Create Your Portrait</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="px-8 py-6 text-base">
                  <Link href="/gallery">See more examples</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
