import { Skeleton } from '@/ui/primitives/skeleton';

export default function CollectionLoading() {
  return (
    <div className="space-y-10">
      <div className="flex justify-center gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-7 rounded-full" />
        ))}
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="space-y-4 lg:w-80">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="aspect-square w-full rounded-xl" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-6 h-10 w-40" />
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    </div>
  );
}
