import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getAiPortraitProductsByCollection } from '@/domains/ai/ai-portrait/get-ai-portrait-product.service';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import CreateProductRow from '@/ui/components/create/islands/CreateProductRow';
import { Button } from '@/ui/primitives/button';

import { ArrowLeft } from 'lucide-react';

interface CollectionPageProps {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{
    artwork?: string;
    photo?: string;
    styleId?: string;
    generationId?: string;
    urls?: string;
  }>;
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

  const backHref = `${config.routes.createCollections}${buildCreateFlowQueryString({
    artwork,
    photo,
    styleId,
    generationId,
    urls,
  })}`;

  return (
    <>
      <CreateProgressBar currentStep="product" />

      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            Back to formats
          </Link>
        </Button>

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
          <div>
            <h2 className="text-heading-3">{data.collectionTitle}</h2>
            <p className="text-body-sm text-muted-foreground">
              Tap a product to see details and add to cart.
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
                originalPhotoUrl={photo}
                styleId={styleId}
                generationId={generationId}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
