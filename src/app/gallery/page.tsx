import type { Metadata } from 'next';
import Link from 'next/link';

import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import PageBanner from '@/ui/components/PageBanner';
import { Button } from '@/ui/components/ui/button';

import GalleryGrid from '../../ui/components/GalleryGrid';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.gallery.title,
  description: seo.gallery.description,
  url: '/gallery',
});

const GALLERY_ITEMS = [
  {
    id: '1',
    style: 'Pixar',
    petType: 'Golden Retriever',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
  },
  {
    id: '2',
    style: 'Watercolor',
    petType: 'Cat',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
  },
  {
    id: '3',
    style: 'Anime',
    petType: 'Husky',
    image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600',
  },
  {
    id: '4',
    style: 'Royal',
    petType: 'Poodle',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
  },
  {
    id: '5',
    style: 'Cyberpunk',
    petType: 'German Shepherd',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
  },
  {
    id: '6',
    style: 'Pixar',
    petType: 'Cat',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
  },
];

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
              <h2 className="text-heading-3 tracking-tight">Featured Styles</h2>
              <p className="text-body-sm text-muted-foreground max-w-2xl">
                Each portrait is custom crafted with our studio-grade AI and printed on premium
                materials.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/create">Start creating</Link>
            </Button>
          </div>

          <GalleryGrid items={GALLERY_ITEMS} ariaLabel="Featured portraits" />

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
