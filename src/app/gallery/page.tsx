import type { Metadata } from 'next';
import Link from 'next/link';

import seo from '@/data/seo';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import PageBanner from '@/ui/components/PageBanner';
import { Button } from '@/ui/components/ui/button';

import GalleryGrid from './_components/GalleryGrid';

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
        title="Portrait Gallery"
        description="Inspiration from our community. Browse stunning AI-generated pet portraits across all styles."
        className="py-10 md:py-14"
      />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <GalleryGrid items={GALLERY_ITEMS} />

        <div className="mt-16 text-center">
          <Button size="lg" asChild className="px-8 py-6 text-base shadow-lg">
            <Link href="/create">Create Your Portrait</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
