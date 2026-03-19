import { redirect } from 'next/navigation';

import { getAllCollections } from '@/domains/collections/collections.service';

export const revalidate = 3600;

const CollectionsPage = async () => {
  const collections = await getAllCollections();

  if (collections.length > 0 && collections[0]) {
    redirect(`/shop/${collections[0].node.handle}`);
  }

  redirect('/');
};

export default CollectionsPage;
