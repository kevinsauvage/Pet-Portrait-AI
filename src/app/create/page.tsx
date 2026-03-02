import type { Metadata } from 'next';

import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import UploadIsland from '@/ui/components/create/islands/UploadIsland';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.title,
  description: seo.create.description,
  url: '/create',
});

export default function CreatePage() {
  return (
    <>
      <CreateProgressBar currentStep="upload" />
      <UploadIsland />
    </>
  );
}
