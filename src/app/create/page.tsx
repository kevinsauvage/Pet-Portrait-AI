import { Suspense } from 'react';
import type { Metadata } from 'next';

import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import CreateWizard from '@/ui/components/create/CreateWizard';
import HowItWorks from '@/ui/components/shared/HowItWorks';
import PageBanner from '@/ui/components/shared/PageBanner';
import { CREATE_HOW_IT_WORKS } from '@/ui/content/marketing';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.create.title,
  description: seo.create.description,
  url: '/create',
});

const CreatePage = () => {
  return (
    <div>
      <PageBanner
        title="Create Your Pet Portrait"
        description="Upload a photo, pick a style, and watch AI transform your pet into stunning artwork."
        className="py-10 md:py-14"
      />
      <HowItWorks
        id="create-how-it-works"
        title="Create your portrait in minutes"
        description="Four quick steps to go from upload to checkout."
        steps={CREATE_HOW_IT_WORKS}
        className="bg-muted/30"
      />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Suspense fallback={<div className="min-h-[400px] animate-pulse rounded-2xl bg-muted" />}>
          <CreateWizard />
        </Suspense>
      </div>
    </div>
  );
};

export default CreatePage;
