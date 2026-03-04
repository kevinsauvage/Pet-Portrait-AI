import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';

const AdminLoading = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card key={item}>
            <CardHeader className="pb-2">
              <CardTitle className="text-body-sm font-medium text-muted-foreground">
                <Skeleton className="h-4 w-28" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoading;
