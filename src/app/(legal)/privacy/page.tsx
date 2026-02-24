import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getPrivacyPolicy } from '@/domains/legal/services/policies.service';
import Breadcrumbs from '@/ui/components/navigation/Breadcrumbs';
import PageBanner from '@/ui/components/shared/PageBanner';
import MainContent from '@/ui/layouts/MainContent';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.privacy.title,
  description: seo.pages.privacy.description,
  url: config.routes.privacy,
});

const PrivacyPage = async () => {
  const privacyPolicy = await getPrivacyPolicy();
  const { title, description } = seo.pages.privacy || {};

  return (
    <div>
      <PageBanner title={title} description={description}>
        <Breadcrumbs lastElement={title} />
      </PageBanner>
      <MainContent>
        {privacyPolicy?.body && <div dangerouslySetInnerHTML={{ __html: privacyPolicy.body }} />}
      </MainContent>
    </div>
  );
};

export default PrivacyPage;
