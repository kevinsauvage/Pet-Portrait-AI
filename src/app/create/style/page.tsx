import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { AI_ART_STYLES } from '@/domains/ai/ai-portrait/types';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import { Button } from '@/ui/primitives/button';

import { ArrowLeft, Palette } from 'lucide-react';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.style.title,
  description: seo.create.style.description,
  url: '/create/style',
  noindex: true,
});

interface StylePageProps {
  searchParams: Promise<{ photo?: string }>;
}

export default async function StylePage({ searchParams }: StylePageProps) {
  const { photo } = await searchParams;

  if (!photo) redirect(config.routes.create);

  return (
    <>
      <CreateProgressBar currentStep="style" />

      <div className="space-y-8">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href={config.routes.create}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="flex flex-col items-start gap-8 md:flex-row">
          <div className="shrink-0">
            <div className="relative h-48 w-48 overflow-hidden rounded-xl border shadow-md md:h-56 md:w-56">
              <Image src={photo} alt="Your pet" fill className="object-cover" sizes="224px" />
            </div>
            <p className="mt-3 text-center text-caption-sm text-muted-foreground">Your pet photo</p>
          </div>

          <div className="flex-1">
            <h3 className="mb-1 flex items-center gap-2 text-heading-4">
              <Palette className="h-5 w-5 text-primary" />
              Choose an art style
            </h3>
            <p className="mb-5 text-body-sm text-muted-foreground">
              Select a style to transform your pet into artwork.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {AI_ART_STYLES.map((style) => {
                const href = `${config.routes.createGenerating}${buildCreateFlowQueryString({
                  photo,
                  styleId: style.id,
                })}`;

                return (
                  <Link
                    key={style.id}
                    href={href}
                    className="group flex w-full items-center gap-4 rounded-xl border bg-card text-left transition-all hover:border-primary hover:shadow-md"
                  >
                    <Image
                      src={style.previewImage}
                      alt={style.label}
                      className="max-h-[100px] max-w-[100px] rounded-lg object-cover"
                      sizes="100px"
                      width={100}
                      height={100}
                    />
                    <div className="min-w-0 flex-1 p-4">
                      <p className="text-body-sm font-medium transition-colors group-hover:text-primary">
                        {style.label}
                      </p>
                      <p className="line-clamp-3 text-caption-sm text-muted-foreground">
                        {style.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
