import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { generatePortraitAction } from '@/domains/ai/actions';
import { isValidStyleId } from '@/domains/ai/ai-portrait/types';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.generating.title,
  description: seo.create.generating.description,
  url: '/create/generating',
  noindex: true,
});

export const maxDuration = 120; // Allow up to 2 minutes for generation

interface GeneratingPageProps {
  searchParams: Promise<{ photo?: string; styleId?: string }>;
}

export default async function GeneratingPage({ searchParams }: GeneratingPageProps) {
  const { photo, styleId } = await searchParams;

  if (!photo || !styleId || !isValidStyleId(styleId)) {
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

  redirect(`${config.routes.createSelect}${queryString}${urlsParam}`);
}
