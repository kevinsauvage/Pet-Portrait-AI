import type { Metadata } from 'next';
import Link from 'next/link';

import seo from '@/core/config/seo';
import { storefrontSdk } from '@/infra/shopify/client';
import { CollectionSortKeys } from '@/infra/shopify/storefront/index';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import CollectionGrid from '@/ui/components/CollectionGrid/CollectionGrid';
import PageBanner from '@/ui/components/PageBanner';
import { Button } from '@/ui/components/ui/button';

import { ImageIcon, Palette, ShoppingBag } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = generateMetadataUtil({
  title: seo.shop.title,
  description: seo.shop.description,
  url: '/shop',
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
          <section>
            <h2 className="text-heading-2 mb-8 md:mb-10">All collections</h2>
            <CollectionGrid collections={collections} />
          </section>
        ) : (
          <div className="max-w-md mx-auto text-center">
            <div className="rounded-2xl border border-dashed border-border bg-muted/50 dark:bg-muted/20 p-10 md:p-12">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <ShoppingBag className="h-7 w-7 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="text-heading-3 mb-2">No collections yet</h2>
              <p className="text-body text-muted-foreground mb-8">
                Create your pet portrait or explore our styles to get started.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
                  <Link href="/create">
                    <Palette className="h-4 w-4" />
                    Create Your Portrait
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  <Link href="/styles">
                    <ImageIcon className="h-4 w-4" />
                    View Portrait Styles
                  </Link>
                </Button>
              </div>
              <p className="text-body-sm text-muted-foreground mt-6">
                <Link href="/gallery" className="link">
                  Browse gallery
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
