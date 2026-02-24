import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { COLLECTION_SORT_OPTIONS } from '@/domains/collections/constants/sort-options';
import {
  getCollectionPageData,
  getCollectionSeo,
} from '@/domains/collections/services/collections.service';
import Filters from '@/ui/components/catalog/Filters';
import ListingHeader from '@/ui/components/catalog/ListingHeader';
import PageInfoPagination from '@/ui/components/catalog/PageInfoPagination';
import ProductEdgeList from '@/ui/components/catalog/ProductsEdgeList';
import Sort from '@/ui/components/catalog/Sort';
import EmptyState from '@/ui/components/shared/EmptyState';
import { Button } from '@/ui/primitives/button';

export const revalidate = config.constants.revalidate.catalog;

type parametersType = { collectionSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<parametersType>;
}): Promise<Metadata> {
  const { collectionSlug } = await params;

  const collection = await getCollectionSeo(collectionSlug);

  if (!collection) {
    return generateMetadataUtil({
      title: 'Collection Not Found',
      description: 'Collection not found',
      url: `/shop/${collectionSlug}`,
      noindex: true,
    });
  }

  const title = collection.seo?.title || collection.title || 'Collection';
  const description = collection.seo?.description || collection.description || 'Collection';
  const collectionImage = collection.image?.originalSrc;

  return generateMetadataUtil({
    title,
    description,
    url: `/shop/${collectionSlug}`,
    image: collectionImage,
  });
}

const CollectionSlugPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ collectionSlug: string }>;
  searchParams?: Promise<{
    after?: string;
    before?: string;
    filters?: string;
    sort_key?: string;
    reverse?: boolean;
  }>;
}) => {
  const { collectionSlug } = await params;
  const searchParameters = (await searchParams) || {};

  const { edges, filters, pageInfo, sortKey } = await getCollectionPageData(
    collectionSlug,
    searchParameters,
  );
  const safeSearchParameters = {
    after: searchParameters?.after,
    before: searchParameters?.before,
    sort_key: searchParameters?.sort_key ?? sortKey,
  };

  if (!edges?.length) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <EmptyState
          variant="default"
          title="Collection not found"
          subtitle="This collection doesn't exist or has been removed. Browse our other collections to find what you're looking for."
          altText="Collection Not Found"
          primaryAction={
            <Link href="/shop">
              <Button variant="default">Browse Collections</Button>
            </Link>
          }
          secondaryAction={
            <Link href="/" className="link">
              Go home
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
      <ListingHeader>
        <Sort
          query={searchParameters?.sort_key ? searchParameters : { sort_key: sortKey }}
          sortingOptions={COLLECTION_SORT_OPTIONS}
        />
        <Filters filters={filters} query={safeSearchParameters} />
      </ListingHeader>

      {edges && edges.length > 0 ? (
        <ProductEdgeList products={edges} layout="grid" />
      ) : (
        <EmptyState
          variant="default"
          title="No products found"
          subtitle="This collection is empty or your filters are too specific. Try adjusting your filters or browse other collections."
          altText="No products found"
          primaryAction={
            <Button variant="default" asChild>
              <Link href="/shop">Browse All Collections</Link>
            </Button>
          }
          secondaryAction={
            <Link href="/" className="link">
              Go home
            </Link>
          }
        />
      )}
      <PageInfoPagination pageInfo={pageInfo} searchParameters={safeSearchParameters} />
    </div>
  );
};

export default CollectionSlugPage;
