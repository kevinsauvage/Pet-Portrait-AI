import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { generatePortraitAction } from '@/domains/ai/actions';
import type { CreateFlowParams } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { validateAndRedirect } from '@/domains/ai/ai-portrait/utils/validate-create-flow-step';
import CreateFlowBackButton from '@/ui/components/create/CreateFlowBackButton';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import ProtectedImage from '@/ui/components/media/ProtectedImage';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.generating.title,
  description: seo.create.generating.description,
  url: '/create/generating',
  noindex: true,
});

export const maxDuration = 300;

interface GeneratingPageProps {
  searchParams: Promise<CreateFlowParams>;
}

export default async function GeneratingPage({ searchParams }: GeneratingPageProps) {
  const params = await searchParams;
  const { photo, styleId, generationId, urls } = params;

  validateAndRedirect('generating', params);

  const artworkUrls = urls ? urls.split('|').filter(Boolean) : [];
  const hasGeneratedImages = artworkUrls.length > 0 && generationId;

  if (!hasGeneratedImages && (!photo || !styleId)) {
    redirect(config.routes.create);
  }

  if (!hasGeneratedImages) {
    if (!photo || !styleId) {
      redirect(config.routes.create);
    }
    const result = await generatePortraitAction(photo, styleId);

    if (!result.success) {
      redirect(`${config.routes.createStyle}${buildCreateFlowQueryString({ photo })}`);
    }

    const { data } = result;
    if (!data.urls?.length) {
      redirect(`${config.routes.createStyle}${buildCreateFlowQueryString({ photo })}`);
    }

    const encodedUrls = encodeURIComponent(data.urls.join('|'));
    const queryString = buildCreateFlowQueryString({
      photo,
      styleId: data.styleId,
      generationId: data.generationId,
    });
    const urlsParam = encodedUrls ? `&urls=${encodedUrls}` : '';

    redirect(`${config.routes.createGenerating}${queryString}${urlsParam}`);
  }

  return (
    <>
      <CreateProgressBar currentStep="generating" />

      <div className="space-y-8">
        <CreateFlowBackButton target="style" photo={photo} />

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-heading-3 font-semibold">Choose Your Favourite</h2>
            <p className="text-body text-muted-foreground max-w-2xl">
              Select the portrait you love most to continue. If you are signed in, your generation is
              saved under My creations in your account.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
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
                  className="group relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-border transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  <ProtectedImage
                    src={url}
                    alt={`Variation ${variationNumber}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  <div className="absolute bottom-3 right-3 rounded-lg bg-background/95 backdrop-blur-sm px-3 py-2 text-caption font-semibold shadow-lg border border-border/50 transition-all duration-300 group-hover:scale-105 z-20">
                    #{variationNumber}
                  </div>
                  <div className="absolute inset-0 ring-4 ring-primary/0 group-hover:ring-primary/20 rounded-2xl transition-all duration-300 z-10 pointer-events-none" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
