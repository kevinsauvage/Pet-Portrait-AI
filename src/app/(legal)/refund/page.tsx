import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { storefrontSdk } from '@/infra/shopify/client';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import MainContent from '@/ui/components/MainContent';
import PageBanner from '@/ui/components/PageBanner';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.refund.title,
  description: seo.pages.refund.description,
  url: config.routes.refund,
});

const RefundPage = async () => {
  const response = await storefrontSdk().getRefundPolicy({});
  const refundPolicy = response.shop?.refundPolicy;

  const { title, description } = seo.pages.refund || {};

  return (
    <div>
      <PageBanner title={title} description={description}>
        <Breadcrumbs lastElement={title} />
      </PageBanner>
      <MainContent>
        {refundPolicy?.body && <div dangerouslySetInnerHTML={{ __html: refundPolicy.body }} />}
      </MainContent>
    </div>
  );
};

export default RefundPage;
