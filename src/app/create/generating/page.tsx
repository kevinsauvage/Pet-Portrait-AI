import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { generatePortraitAction } from '@/domains/ai/actions';
import { isValidStyleId } from '@/domains/ai/ai-portrait/types';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import { Button } from '@/ui/primitives/button';

import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.generating.title,
  description: seo.create.generating.description,
  url: '/create/generating',
  noindex: true,
});

export const maxDuration = 300; // 5 minutes max (safe upper bound)

interface GeneratingPageProps {
  searchParams: Promise<{
    photo?: string;
    styleId?: string;
    generationId?: string;
    urls?: string;
  }>;
}

export default async function GeneratingPage({ searchParams }: GeneratingPageProps) {
  const { photo, styleId, generationId, urls } = await searchParams;

  if (!photo || !styleId || !isValidStyleId(styleId)) {
    redirect(config.routes.create);
  }

  // If URLs are already in query params, skip generation and display images
  const artworkUrls = urls ? urls.split('|').filter(Boolean) : [];
  const hasGeneratedImages = artworkUrls.length > 0 && generationId;

  if (!hasGeneratedImages) {
    // Generate images
    const result = await generatePortraitAction(photo, styleId);

    if (!result.success) {
      redirect(`${config.routes.createStyle}${buildCreateFlowQueryString({ photo })}`);
    }

    const { data } = result;
    if (!data.urls?.length) {
      redirect(`${config.routes.createStyle}${buildCreateFlowQueryString({ photo })}`);
    }

    // Redirect to same page with URLs in query params
    const encodedUrls = encodeURIComponent(data.urls.join('|'));
    const queryString = buildCreateFlowQueryString({
      photo,
      styleId: data.styleId,
      generationId: data.generationId,
    });
    const urlsParam = encodedUrls ? `&urls=${encodedUrls}` : '';

    redirect(`${config.routes.createGenerating}${queryString}${urlsParam}`);
    return null;
  }

  // Display generated images
  const backHref = `${config.routes.createStyle}${buildCreateFlowQueryString({ photo })}`;

  return (
    <>
      <CreateProgressBar currentStep="generating" />

      <div className="space-y-8">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <div>
          <h3 className="mb-2 text-heading-3">Choose Your Favorite</h3>
          <p className="mb-8 text-body text-muted-foreground">
            Click the portrait you love most to continue. You can order it as a digital download or
            premium print.
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {artworkUrls.map((url, i) => {
              const variationNumber = i + 1;
              const href = `${config.routes.createCollections}${buildCreateFlowQueryString({
                artwork: url,
                photo,
                styleId,
                generationId,
                urls,
              })}`;

              return (
                <Link
                  key={url}
                  href={href}
                  className="group relative aspect-square w-full overflow-hidden rounded-xl border-2 border-border transition-all hover:border-primary hover:shadow-lg hover:ring-4 hover:ring-primary/20"
                >
                  <Image
                    src={url}
                    alt={`Variation ${variationNumber}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-1 text-caption-sm font-medium backdrop-blur-sm">
                    #{variationNumber}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
