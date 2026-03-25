import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getAiPortraitProductsByCollection } from '@/domains/ai/ai-portrait/get-ai-portrait-product.service';
import type { CreateFlowParams } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import CreateFlowArtworkPreview from '@/ui/components/create/CreateFlowArtworkPreview';
import CreateFlowBackButton from '@/ui/components/create/CreateFlowBackButton';
import CreateProductRow from '@/ui/components/create/islands/CreateProductRow';

interface CollectionPageProps {
  params: Promise<{ collection: string }>;
  searchParams: Promise<CreateFlowParams>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { collection } = await params;
  const data = await getAiPortraitProductsByCollection(collection);

  return generateMetadataUtil({
    title: data?.collectionTitle ?? seo.create.collections.title,
    description: seo.create.collections.description,
    url: `/create/collections/${collection}`,
    noindex: true,
  });
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { collection } = await params;
  const { artwork, photo, styleId, generationId, urls } = await searchParams;

  const data = await getAiPortraitProductsByCollection(collection);

  if (!data) notFound();

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
        <div>
          <h2 className="text-heading-3">{data.collectionTitle}</h2>
          <p className="text-body-sm text-muted-foreground">
            Select a product to choose size and add to cart.
          </p>
        </div>
      </div>

      {data.products.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No products found in this collection.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.products.map((product) => (
            <CreateProductRow
              key={product.shopifyProductId}
              product={product}
              artworkUrl={artwork}
              photo={photo}
              styleId={styleId}
              generationId={generationId}
              urls={urls}
            />
          ))}
        </div>
      )}
    </div>
  );
}
