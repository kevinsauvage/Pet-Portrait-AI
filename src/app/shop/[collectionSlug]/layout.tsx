import { getCollectionLayoutData } from '@/domains/collections/services/collections.service';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import CollectionNav from '@/ui/components/CollectionNav';
import PageBanner from '@/ui/components/PageBanner';

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { collectionSlug: string };
}) => {
  const { collectionSlug } = params;

  const { collection, navMenu } = await getCollectionLayoutData(collectionSlug);
  const { title, description } = collection || {};

  return (
    <div>
      <PageBanner title={title || 'Collection'} description={description}>
        <div className="space-y-6">
          <Breadcrumbs />
          <CollectionNav collectionSlug={collectionSlug} items={navMenu} />
        </div>
      </PageBanner>
      {children}
    </div>
  );
};

export default Layout;
