import { Skeleton } from '@/ui/primitives/skeleton';

const STYLE_SKELETON_IDS = ['style-a', 'style-b', 'style-c', 'style-d', 'style-e', 'style-f'] as const;
const OPTION_SKELETON_IDS = ['option-a', 'option-b', 'option-c', 'option-d', 'option-e', 'option-f', 'option-g', 'option-h'] as const;

export default function StyleLoading() {
  return (
    <div className="space-y-10">
      <div className="flex justify-center gap-4">
        {STYLE_SKELETON_IDS.map((id) => (
          <Skeleton key={id} className="h-7 w-7 rounded-full" />
        ))}
      </div>
      <div className="flex flex-col gap-8 md:flex-row">
        <Skeleton className="h-56 w-56 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-3">
          {OPTION_SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-[100px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
