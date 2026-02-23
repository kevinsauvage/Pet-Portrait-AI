import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { getAllCollections } from '@/domains/collections/services/collections.service';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import CollectionGrid from '@/ui/components/CollectionGrid/CollectionGrid';
import PageBanner from '@/ui/components/PageBanner';
import { Button } from '@/ui/components/ui/button';
import { SHOP_PERKS } from '@/ui/content/marketing';

import { ImageIcon, Palette, ShoppingBag } from 'lucide-react';

export const revalidate = config.constants.revalidate.catalog;

export const metadata: Metadata = generateMetadataUtil({
  title: seo.shop.title,
  description: seo.shop.description,
  url: '/shop',
});

const CollectionsPage = async () => {
  const collections = await getAllCollections();

  return (
    <div>
      <PageBanner
        eyebrow="Shop"
        title="Shop the Portrait Collection"
        description="Browse curated sets of canvas prints, posters, and digital pet portraits."
        ctaLabel="Create Your Portrait"
        ctaHref="/create"
        secondaryCtaLabel="Browse Gallery"
        secondaryCtaHref="/gallery"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
          {SHOP_PERKS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </span>
              <span className="text-body-sm font-medium text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </PageBanner>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          {collections.length > 0 ? (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-heading-2 tracking-tight">All collections</h2>
                  <p className="text-body-sm text-muted-foreground max-w-2xl">
                    Signature series, seasonal releases, and premium print formats ready to
                    customize.
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/create">Start creating</Link>
                </Button>
              </div>
              <CollectionGrid collections={collections} ariaLabel="All collections" />
            </div>
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
      </section>
    </div>
  );
};

export default CollectionsPage;
