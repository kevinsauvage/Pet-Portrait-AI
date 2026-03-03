import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getAiPortraitCollections } from '@/domains/ai/ai-portrait/get-ai-portrait-collections.service';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import CollectionsBackButton from '@/ui/components/create/CollectionsBackButton';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.collections.title,
  description: seo.create.collections.description,
  url: '/create/collections',
  noindex: true,
});

interface CollectionsPageProps {
  searchParams: Promise<{
    artwork?: string;
    photo?: string;
    styleId?: string;
    generationId?: string;
    urls?: string;
  }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const { artwork, photo, styleId, generationId, urls } = await searchParams;
  const collections = await getAiPortraitCollections();

  // Redirect to first collection if available, otherwise show empty state
  if (collections.length > 0) {
    const firstCollection = collections[0];
    const queryString = buildCreateFlowQueryString({
      artwork,
      photo,
      styleId,
      generationId,
      urls,
    });
    redirect(`${config.routes.createCollections}/${firstCollection?.handle}${queryString}`);
  }

  // Empty state - this will be shown in the layout's children area
  return (
    <div className="space-y-6">
      <CollectionsBackButton
        photo={photo}
        styleId={styleId}
        generationId={generationId}
        urls={urls}
      />

      <div className="flex items-center gap-4">
        {artwork && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border shadow-sm">
            <Image
              src={artwork}
              alt="Your selected portrait"
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <div className="space-y-2">
          <h2 className="text-heading-2 tracking-tight">Choose Your Product</h2>
          <p className="text-body-sm text-muted-foreground max-w-2xl">
            Select how you would like to receive your portrait. Choose from digital downloads or
            premium print options.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto text-center">
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 dark:bg-muted/20 p-10 md:p-12">
          <p className="text-body text-muted-foreground">
            No products available yet. Please check your Shopify collections.
          </p>
        </div>
      </div>
    </div>
  );
}
