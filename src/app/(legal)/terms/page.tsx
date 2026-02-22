import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { storefrontSdk } from '@/infra/shopify/client';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import MainContent from '@/ui/components/MainContent';
import PageBanner from '@/ui/components/PageBanner';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.terms.title,
  description: seo.pages.terms.description,
  url: config.routes.terms,
});

const TermsPage = async () => {
  const response = await storefrontSdk().getTermsOfService({});
  const { termsOfService } = response?.shop || {};
  const { title, description } = seo.pages.terms || {};
  return (
    <div>
      <PageBanner title={title} description={description}>
        <Breadcrumbs lastElement={title} />
      </PageBanner>
      <MainContent>
        {termsOfService?.body && <div dangerouslySetInnerHTML={{ __html: termsOfService.body }} />}
      </MainContent>
    </div>
  );
};

export default TermsPage;
