import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * Main-column placeholder for /shop/* while nested async layouts or pages load.
 * Matches listing layout (title, sort bar, product grid) so the sidebar never pairs with a blank pane.
 */
export default function ShopCollectionMainSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => `shop-main-skeleton-${i}`).map((key) => (
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
}
