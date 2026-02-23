import ListDisplay from '@/ui/components/shared/ListDisplay';
import { Skeleton } from '@/ui/primitives/skeleton';

const Loading = () => {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 space-y-12 flex flex-col ">
      <section className="rounded-3xl border border-border/60 bg-card p-8 md:p-12 flex flex-col items-center justify-center">
        <div className="space-y-4 max-w-3xl flex flex-col items-center justify-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Skeleton className="h-12 w-44" />
            <Skeleton className="h-12 w-44" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`perk-${index + 1}`} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`collection-${index + 1}`} className="h-64 rounded-2xl" />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <ListDisplay layout="grid" loading={true}>
          {null}
        </ListDisplay>
      </section>
    </div>
  );
};

export default Loading;
