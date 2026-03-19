import { getCollectionLayoutData } from '@/domains/collections/collections.service';
import CollectionLayoutContent from '@/ui/components/catalog/CollectionLayoutContent';

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ collectionSlug: string }>;
}) => {
  const { collectionSlug } = await params;

  const { collection } = await getCollectionLayoutData(collectionSlug);
  const { title, description } = collection || {};

  return (
    <CollectionLayoutContent collectionTitle={title} collectionDescription={description}>
      {children}
    </CollectionLayoutContent>
  );
};

export default Layout;
