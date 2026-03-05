import type { Metadata } from 'next';

import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getCreateFlowUrl } from '@/domains/create-flow/services/create-flow.service';
import CreatePageWithEntryDialog from '@/ui/components/create/CreatePageWithEntryDialog';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.title,
  description: seo.create.description,
  url: '/create',
});

interface CreatePageProps {
  searchParams: Promise<{ styleId?: string }>;
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const { styleId } = await searchParams;
  const createFlowUrl = await getCreateFlowUrl();

  return (
    <>
      <CreateProgressBar currentStep="upload" />
      <CreatePageWithEntryDialog createFlowUrl={createFlowUrl} initialStyleId={styleId} />
    </>
  );
}
