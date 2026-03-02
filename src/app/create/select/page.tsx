import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import { Button } from '@/ui/primitives/button';

import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.select.title,
  description: seo.create.select.description,
  url: '/create/select',
  noindex: true,
});

interface SelectPageProps {
  searchParams: Promise<{
    photo?: string;
    styleId?: string;
    generationId?: string;
    urls?: string;
  }>;
}

export default async function SelectPage({ searchParams }: SelectPageProps) {
  const { photo, styleId, generationId, urls } = await searchParams;

  const artworkUrls = urls ? urls.split('|').filter(Boolean) : [];

  if (!photo || !styleId || !generationId || !artworkUrls.length) {
    redirect(config.routes.create);
  }

  const backHref = `${config.routes.createStyle}${buildCreateFlowQueryString({ photo })}`;

  return (
    <>
      <CreateProgressBar currentStep="select" />

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
                    alt={`Variation ${i + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-1 text-caption-sm font-medium backdrop-blur-sm">
                    #{i + 1}
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
