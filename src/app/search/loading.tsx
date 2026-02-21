import seo from '@/data/seo';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import ListDisplay from '@/ui/components/ListDisplay';
import ListingHeader from '@/ui/components/ListingHeader';
import PageBanner from '@/ui/components/PageBanner';
import { Skeleton } from '@/ui/components/ui/skeleton';

const Loading = () => {
  return (
    <div>
      <PageBanner title={seo.search.title} description={seo.search.description}>
        <Breadcrumbs />
        <Skeleton className="h-10 w-full max-w-md mx-auto" />
      </PageBanner>
      <div className="container mx-auto mb-8 px-4">
        <ListingHeader>
          <div className="flex gap-2">
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
