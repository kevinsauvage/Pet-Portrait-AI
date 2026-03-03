import ListDisplay from '@/ui/components/shared/ListDisplay';
import { Skeleton } from '@/ui/primitives/skeleton';

const Loading = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-9 w-32 rounded" />
      <ListDisplay layout="grid" loading={true}>
        {null}
      </ListDisplay>
    </div>
  );
};

export default Loading;
