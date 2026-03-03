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
  searchParams: Promise<{ photo?: string; styleId?: string }>;
}

export default async function StylePage({ searchParams }: StylePageProps) {
  const { photo, styleId } = await searchParams;

  if (!photo) redirect(config.routes.create);

  // If styleId is already selected, redirect directly to generating
  if (styleId) {
    const { isValidStyleId } = await import('@/domains/ai/ai-portrait/types');
    if (isValidStyleId(styleId)) {
      redirect(
        `${config.routes.createGenerating}${buildCreateFlowQueryString({
          photo,
          styleId,
        })}`,
      );
    }
  }

  return (
    <>
      <CreateProgressBar currentStep="style" />

      <div className="space-y-8">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
          <Link href={`${config.routes.create}${buildCreateFlowQueryString({ styleId })}`}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-12">
          {/* Photo Preview */}
          <div className="w-full lg:w-auto shrink-0">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-64 w-64 overflow-hidden rounded-2xl border-2 border-border shadow-xl md:h-72 md:w-72">
                <Image
                  src={photo}
                  alt="Your pet"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 256px, 288px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            <p className="mt-4 text-center text-body-sm font-medium text-muted-foreground">
              Your pet photo
            </p>
          </div>

          {/* Style Selection */}
          <div className="flex-1 w-full">
            <div className="mb-8 space-y-3">
              <h2 className="flex items-center gap-3 text-heading-3 font-semibold">
                <div className="rounded-xl bg-primary/10 p-2">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                Choose an art style
              </h2>
              <p className="text-body text-muted-foreground max-w-2xl">
                Select a style to transform your pet into stunning artwork. Each style offers a unique
                artistic interpretation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {AI_ART_STYLES.map((style) => {
                if (!style.id) return null;

                const href = `${config.routes.createGenerating}${buildCreateFlowQueryString({
                  photo,
                  styleId: style.id,
                })}`;

                return (
                  <Link
                    key={style.id}
                    href={href}
                    className="group relative flex w-full items-start gap-4 rounded-2xl border-2 border-border bg-card p-5 text-left transition-all duration-300 hover:border-primary/60 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative shrink-0 h-24 w-24 overflow-hidden rounded-xl border border-border/50 shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src={style.previewImage}
                        alt={style.label}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-body font-semibold transition-colors duration-300 group-hover:text-primary">
                        {style.label}
                      </p>
                      <p className="line-clamp-2 text-body-sm text-muted-foreground leading-relaxed">
                        {style.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-caption-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Select style →
                        </span>
                      </div>
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
