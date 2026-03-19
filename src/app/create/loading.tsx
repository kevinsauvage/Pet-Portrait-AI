import { Skeleton } from '@/ui/primitives/skeleton';

const STEP_SKELETON_IDS = ['step-a', 'step-b', 'step-c', 'step-d', 'step-e', 'step-f'] as const;

export default function CreateLoading() {
  return (
    <div className="space-y-10">
      <div className="flex justify-center gap-4">
        {STEP_SKELETON_IDS.map((id) => (
          <Skeleton key={id} className="h-7 w-7 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-[320px] w-full rounded-2xl" />
    </div>
  );
}
