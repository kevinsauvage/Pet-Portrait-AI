import type { CollectionsQuery } from '@/infra/shopify/generated/storefront/index';
import CollectionCard from '@/ui/components/catalog/CollectionCard';

type CollectionGridProps = {
  collections: CollectionsQuery['collections']['edges'];
  ariaLabel?: string;
};

const CollectionGrid = ({ collections, ariaLabel = 'Collections' }: CollectionGridProps) => {
  if (!Array.isArray(collections) || collections.length === 0) {
    return null;
  }

  return (
    <ul
      aria-label={ariaLabel}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 list-none p-0 m-0"
    >
      {collections.map((collection, index) => (
        <li key={collection.node.id || collection.node.title + index}>
          <CollectionCard collection={collection.node} priority={index < 6} />
        </li>
      ))}
    </ul>
  );
};

export default CollectionGrid;
