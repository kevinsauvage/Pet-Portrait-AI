import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getShippingPolicy } from '@/domains/legal/policies.service';
import LegalContent from '@/ui/components/legal/LegalContent';
import PageBanner from '@/ui/components/shared/PageBanner';
import MainContent from '@/ui/layouts/MainContent';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.shipping.title,
  description: seo.pages.shipping.description,
  url: config.routes.shipping,
});

const ShippingPage = async () => {
  const shippingPolicy = await getShippingPolicy();
  const { title, description } = seo.pages.shipping;

  return (
    <div>
      <PageBanner title={title} description={description} />
      <MainContent className="px-4 py-12 md:px-6 md:py-16">
        {shippingPolicy?.body ? (
          <LegalContent html={shippingPolicy.body} />
        ) : (
          <p className="text-muted-foreground">Policy content is not available at this time.</p>
        )}
      </MainContent>
    </div>
  );
};

export default ShippingPage;
