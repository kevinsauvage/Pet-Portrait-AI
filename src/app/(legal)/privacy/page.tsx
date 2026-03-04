import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getPrivacyPolicy } from '@/domains/legal/services/policies.service';
import LegalContent from '@/ui/components/legal/LegalContent';
import PageBanner from '@/ui/components/shared/PageBanner';
import MainContent from '@/ui/layouts/MainContent';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.privacy.title,
  description: seo.pages.privacy.description,
  url: config.routes.privacy,
});

const PrivacyPage = async () => {
  const privacyPolicy = await getPrivacyPolicy();
  const { title, description } = seo.pages.privacy;

  return (
    <div>
      <PageBanner title={title} description={description} />
      <MainContent className="px-4 py-12 md:px-6 md:py-16">
        {privacyPolicy?.body ? (
          <LegalContent html={privacyPolicy.body} />
        ) : (
          <p className="text-muted-foreground">Policy content is not available at this time.</p>
        )}
      </MainContent>
    </div>
  );
};

export default PrivacyPage;
