import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { isValidStyleId } from '@/domains/ai/ai-portrait/types';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import GeneratingIsland from '@/ui/components/create/islands/GeneratingIsland';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.generating.title,
  description: seo.create.generating.description,
  url: '/create/generating',
  noindex: true,
});

interface GeneratingPageProps {
  searchParams: Promise<{ photo?: string; styleId?: string }>;
}

export default async function GeneratingPage({ searchParams }: GeneratingPageProps) {
  const { photo, styleId } = await searchParams;

  if (!photo || !styleId || !isValidStyleId(styleId)) {
    redirect(config.routes.create);
  }

  return (
    <>
      <CreateProgressBar currentStep="generating" />
      <GeneratingIsland photo={photo} styleId={styleId} />
    </>
  );
}
