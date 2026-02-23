import seo from '@/core/config/seo';
import ListingHeader from '@/ui/components/catalog/ListingHeader';
import Breadcrumbs from '@/ui/components/navigation/Breadcrumbs';
import ListDisplay from '@/ui/components/shared/ListDisplay';
import PageBanner from '@/ui/components/shared/PageBanner';
import { Skeleton } from '@/ui/primitives/skeleton';

const Loading = () => {
  return (
    <div>
      <PageBanner title={seo.search.title} description={seo.search.description}>
        <div className="space-y-6">
          <Breadcrumbs />
          <Skeleton className="h-10 w-full max-w-md mx-auto" />
        </div>
      </PageBanner>
      <div className="container mx-auto mb-8 px-4 md:px-6">
        <ListingHeader>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </ListingHeader>
        <ListDisplay layout="grid" loading={true}>
          {null}
        </ListDisplay>
        <div className="flex justify-center mt-8">
          <Skeleton className="h-10 w-64" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
