import { Skeleton } from '@/ui/primitives/skeleton';

export default function CreateLoading() {
  return (
    <div className="space-y-10">
      <div className="flex justify-center gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-7 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-[320px] w-full rounded-2xl" />
    </div>
  );
}
