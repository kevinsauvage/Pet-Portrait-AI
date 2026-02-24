import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getTermsOfService } from '@/domains/legal/services/policies.service';
import Breadcrumbs from '@/ui/components/navigation/Breadcrumbs';
import PageBanner from '@/ui/components/shared/PageBanner';
import MainContent from '@/ui/layouts/MainContent';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.terms.title,
  description: seo.pages.terms.description,
  url: config.routes.terms,
});

const TermsPage = async () => {
  const termsOfService = await getTermsOfService();
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
