import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/data/seo';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import { storefrontSdk } from '@/modules/shopify';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import PageBanner from '@/ui/components/PageBanner';

import MainContent from '../_components/MainContent';

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
