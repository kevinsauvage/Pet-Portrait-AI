import { Skeleton } from '@/ui/primitives/skeleton';

export default function StyleLoading() {
  return (
    <div className="space-y-10">
      <div className="flex justify-center gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-7 rounded-full" />
        ))}
      </div>
      <div className="flex flex-col gap-8 md:flex-row">
        <Skeleton className="h-56 w-56 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
