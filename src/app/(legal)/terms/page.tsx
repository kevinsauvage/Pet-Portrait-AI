import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getTermsOfService } from '@/domains/legal/services/policies.service';
import LegalContent from '@/ui/components/legal/LegalContent';
import PageBanner from '@/ui/components/shared/PageBanner';
import MainContent from '@/ui/layouts/MainContent';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.terms.title,
  description: seo.pages.terms.description,
  url: config.routes.terms,
});

const TermsPage = async () => {
  const termsOfService = await getTermsOfService();
  const { title, description } = seo.pages.terms;

  return (
    <div>
      <PageBanner title={title} description={description} />
      <MainContent className="px-4 py-12 md:px-6 md:py-16">
        {termsOfService?.body ? (
          <LegalContent html={termsOfService.body} />
        ) : (
          <p className="text-muted-foreground">Policy content is not available at this time.</p>
        )}
      </MainContent>
    </div>
  );
};

export default TermsPage;
