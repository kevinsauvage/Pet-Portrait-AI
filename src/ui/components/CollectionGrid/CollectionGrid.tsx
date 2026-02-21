import type { CollectionsQuery } from '@/modules/shopify/storefront';
import CollectionCard from '@/ui/components/CollectionCard';

const CollectionGrid = ({
  collections,
}: {
  collections: CollectionsQuery['collections']['edges'];
}) => {
  if (!Array.isArray(collections) || collections.length === 0) {
    return null;
  }

  return (
    <ul className="collection-grid gap-4 md:gap-6 lg:gap-8">
      {collections.map((collection, index) => (
        <li key={collection.node.id || collection.node.title + index} className="collection-grid-item">
          <CollectionCard collection={collection.node} priority={index < 5} />
        </li>
      ))}
    </ul>
  );
};

export default CollectionGrid;
