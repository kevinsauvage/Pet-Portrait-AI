import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import ListDisplay from '@/ui/components/shared/ListDisplay';
import { Card, CardContent } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';

const Loading = () => {
  return (
    <Card>
      <CardHeaderPattern
        title={<Skeleton className="h-6 w-32" />}
        description={<Skeleton className="h-4 w-full" />}
        actions={<Skeleton className="h-9 w-24" />}
      />
      <CardContent>
        <ListDisplay layout="grid" loading={true}>
          {null}
        </ListDisplay>
      </CardContent>
    </Card>
  );
};

export default Loading;
