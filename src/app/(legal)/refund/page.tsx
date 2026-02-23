import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { getRefundPolicy } from '@/domains/legal/services/policies.service';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import Breadcrumbs from '@/ui/components/navigation/Breadcrumbs';
import PageBanner from '@/ui/components/shared/PageBanner';
import MainContent from '@/ui/layouts/MainContent';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.refund.title,
  description: seo.pages.refund.description,
  url: config.routes.refund,
});

const RefundPage = async () => {
  const refundPolicy = await getRefundPolicy();

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
