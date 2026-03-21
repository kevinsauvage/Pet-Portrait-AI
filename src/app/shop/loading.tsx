import ShopCollectionMainSkeleton from '@/ui/components/catalog/ShopCollectionMainSkeleton';

/**
 * Shown while the shop segment (including [collectionSlug]/layout.tsx) is loading.
 * The ShopLayout sidebar is a parent layout and already rendered — this fills the content column only.
 */
const Loading = () => {
  return <ShopCollectionMainSkeleton />;
};

export default Loading;
