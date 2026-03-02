import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getAiPortraitCollections } from '@/domains/ai/ai-portrait/get-ai-portrait-collections.service';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import { Button } from '@/ui/primitives/button';

import { ArrowLeft } from 'lucide-react';

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

  const backHref = `${config.routes.createSelect}${buildCreateFlowQueryString({
    photo,
    styleId,
    generationId,
    urls,
  })}`;

  return (
    <>
      <CreateProgressBar currentStep="collections" />

      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <div>
          <h2 className="text-heading-3 mb-2">Choose Your Product</h2>
          <p className="text-body text-muted-foreground">
            Select how you would like to receive your portrait.
          </p>
        </div>

        {artwork && (
          <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl border shadow-md">
            <Image
              src={artwork}
              alt="Your selected portrait"
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
        )}

        {collections.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              No products available yet. Please check your Shopify collections.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {collections.map((collection) => {
              const href = `${config.routes.createCollections}/${collection.handle}${buildCreateFlowQueryString(
                {
                  artwork,
                  photo,
                  styleId,
                  generationId,
                  urls,
                },
              )}`;

              return (
                <Link
                  key={collection.handle}
                  href={href}
                  className="group flex items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/60 hover:shadow-md"
                >
                  {collection.image ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={collection.image}
                        alt={collection.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                      🖼
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 font-semibold text-body transition-colors group-hover:text-primary">
                      {collection.title}
                    </p>
                    {collection.description && (
                      <p className="line-clamp-2 text-body-sm text-muted-foreground">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
