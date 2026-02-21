import CardHeaderPattern from '@/ui/components/CardHeaderPattern';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Skeleton } from '@/ui/components/ui/skeleton';

const Loading = () => {
  return (
    <Card>
      <CardHeaderPattern
        title={<Skeleton className="h-6 w-32" />}
        description={<Skeleton className="h-4 w-full" />}
        actions={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-40" />
          </div>
        }
      />
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-address-${index + 1}`}
              className="border rounded-lg p-4 md:p-6 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-10 w-64" />
        </div>
      </CardContent>
    </Card>
  );
};

export default Loading;
