import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { getShippingPolicy } from '@/domains/legal/services/policies.service';
import Breadcrumbs from '@/ui/components/navigation/Breadcrumbs';
import PageBanner from '@/ui/components/shared/PageBanner';
import MainContent from '@/ui/layouts/MainContent';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.shipping.title,
  description: seo.pages.shipping.description,
  url: config.routes.shipping,
});
const ShippingPage = async () => {
  const shippingPolicy = await getShippingPolicy();
  const { title, description } = seo.pages.shipping || {};

  return (
    <div>
      <PageBanner title={title} description={description}>
        <Breadcrumbs lastElement={title} />
      </PageBanner>
      <MainContent>
        {shippingPolicy?.body && <div dangerouslySetInnerHTML={{ __html: shippingPolicy.body }} />}
      </MainContent>
    </div>
  );
};

export default ShippingPage;
