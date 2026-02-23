import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { getPrivacyPolicy } from '@/domains/legal/services/policies.service';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import MainContent from '@/ui/components/MainContent';
import PageBanner from '@/ui/components/PageBanner';

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
