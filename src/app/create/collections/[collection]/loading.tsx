import CreateProgressBar from '@/ui/components/create/CreateProgressBar';
import { Card, CardContent, CardHeader } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';

export default function CollectionLoading() {
  return (
    <>
      <CreateProgressBar currentStep="collections" />
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Aside Navigation Skeleton */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 mx-3 mb-1 rounded-lg" />
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            {/* Back Button */}
            <Skeleton className="h-9 w-20 rounded-md" />

            {/* Header with Image */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            {/* Product Rows */}
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3"
                >
                  <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
