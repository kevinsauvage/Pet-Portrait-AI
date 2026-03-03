import { getCollectionLayoutData } from '@/domains/collections/services/collections.service';
import Breadcrumbs from '@/ui/components/navigation/Breadcrumbs';

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ collectionSlug: string }>;
}) => {
  const { collectionSlug } = await params;

  const { collection } = await getCollectionLayoutData(collectionSlug);
  const { title, description } = collection || {};

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {title && (
        <div className="space-y-1">
          <h1 className="text-heading-2 font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-body-sm text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default Layout;
