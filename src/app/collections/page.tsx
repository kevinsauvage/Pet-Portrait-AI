import type { Metadata } from 'next';
import Link from 'next/link';

import seo from '@/core/config/seo';
import { storefrontSdk } from '@/infra/shopify/client';
import { CollectionSortKeys } from '@/infra/shopify/storefront/index';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import CollectionGrid from '@/ui/components/CollectionGrid/CollectionGrid';
import PageBanner from '@/ui/components/PageBanner';
import { Button } from '@/ui/components/ui/button';

export const revalidate = 3600;

export const metadata: Metadata = generateMetadataUtil({
  title: seo.shop.title,
  description: seo.shop.description,
  url: '/collections',
});

const CollectionsPage = async () => {
  const response = await storefrontSdk().collections({
    first: 100,
    firstProducts: 1,
    identifiers: [],
    sortKey: CollectionSortKeys?.Title,
  });

  const collections = response.collections.edges;

  return (
    <div>
      <PageBanner
        title="Shop"
        description="Browse our product collections — canvas prints, posters, and digital pet portraits."
        className="py-10 md:py-14"
      />

      <div className="container mx-auto px-4 py-12 md:py-16">
        {collections.length > 0 ? (
          <CollectionGrid collections={collections} />
        ) : (
          <div className="max-w-xl mx-auto text-center space-y-6 py-12">
            <p className="text-body text-muted-foreground">
              No collections yet. Create your pet portrait or explore our styles to get started.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/create">Create Your Portrait</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/styles">View Portrait Styles</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
