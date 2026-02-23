import ListDisplay from '@/ui/components/shared/ListDisplay';
import { Skeleton } from '@/ui/primitives/skeleton';

const Loading = () => {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-32 rounded bg-secondary" />
        </div>
        <Skeleton className="h-10 w-28 rounded bg-secondary" />
      </div>
      <ListDisplay layout="grid" loading={true}>
        {null}
      </ListDisplay>
    </div>
  );
};

export default Loading;
