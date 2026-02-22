import ListDisplay from '@/ui/components/ListDisplay';
import { Skeleton } from '@/ui/components/ui/skeleton';

const Loading = () => {
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-10 w-28 rounded bg-secondary" />
        </div>
        <Skeleton className="h-10 w-10 rounded bg-secondary" />
      </div>
      <ListDisplay layout="grid" loading={true}>
        {null}
      </ListDisplay>
    </div>
  );
};

export default Loading;
