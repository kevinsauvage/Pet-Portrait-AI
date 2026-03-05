import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getAiPortraitCollections } from '@/domains/ai/ai-portrait/get-ai-portrait-collections.service';
import type { CreateFlowParams } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import CreateFlowArtworkPreview from '@/ui/components/create/CreateFlowArtworkPreview';
import CreateFlowBackButton from '@/ui/components/create/CreateFlowBackButton';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.collections.title,
  description: seo.create.collections.description,
  url: '/create/collections',
  noindex: true,
});

interface CollectionsPageProps {
  searchParams: Promise<CreateFlowParams>;
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
      <CreateFlowBackButton
        target="generating"
        photo={photo}
        styleId={styleId}
        generationId={generationId}
        urls={urls}
      />

      <div className="flex items-center gap-4">
        {artwork && <CreateFlowArtworkPreview artwork={artwork} size="sm" />}
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
