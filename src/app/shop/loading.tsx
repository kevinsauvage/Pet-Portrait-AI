import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * Shown while the shop segment (including [collectionSlug]/layout.tsx) is loading.
 * The ShopLayout sidebar is a parent layout and already rendered — this fills the content column only.
 */
const Loading = () => {
  return (
    <div className="space-y-6">
      {/* Collection heading */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Filters / sort bar */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => `shop-skeleton-${i}`).map((key) => (
          <div key={key} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2 px-4 pb-4 pt-3.5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="mt-1 h-5 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
