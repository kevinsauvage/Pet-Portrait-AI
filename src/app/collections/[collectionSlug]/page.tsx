import type { Metadata } from 'next';
import Link from 'next/link';

import { storefrontSdk } from '@/modules/shopify';
import { adjustPaginationVariables, parseFiltersQuery } from '@/modules/shopify/helpers';
import { ProductCollectionSortKeys } from '@/modules/shopify/storefront';
import EmptyState from '@/ui/components/EmptyState';
import ListingHeader from '@/ui/components/ListingHeader';
import PageInfoPagination from '@/ui/components/PageInfoPagination';
import ProductEdgeList from '@/ui/components/ProductsEdgeList';
import { Button } from '@/ui/components/ui/button';

import Filters from '../_components/Filters';
import Sort from '../_components/Sort';

export const revalidate = 3600; // Revalidate every hour

type parametersType = { collectionSlug: string };

import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<parametersType>;
}): Promise<Metadata> {
  const { collectionSlug } = await params;

  const collectionResponse = await storefrontSdk().getCollectionSeoByHandle({
    handle: collectionSlug,
  });

  const { collection } = collectionResponse || {};

  if (!collection) {
    return generateMetadataUtil({
      title: 'Collection Not Found',
      description: 'Collection not found',
      url: `/collections/${collectionSlug}`,
      noindex: true,
    });
  }

  const title = collection.seo?.title || collection.title || 'Collection';
  const description = collection.seo?.description || collection.description || 'Collection';
  const collectionImage = collection.image?.originalSrc;

  return generateMetadataUtil({
    title,
    description,
    url: `/collections/${collectionSlug}`,
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

  const sortKey = Object.keys(ProductCollectionSortKeys).find(
    (key) => key.toLowerCase() === searchParameters?.sort_key?.toLowerCase(),
  ) as keyof typeof ProductCollectionSortKeys;

  const response = await storefrontSdk().collection({
    filters: parseFiltersQuery(searchParameters?.filters),
    ...adjustPaginationVariables({
      after: searchParameters?.after || undefined,
      before: searchParameters?.before || undefined,
      first: 16,
      last: 16,
      reverse: searchParameters?.reverse || false,
    }),
    handle: collectionSlug,
    identifiers: [],
    sortKey: ProductCollectionSortKeys[sortKey] || ProductCollectionSortKeys.BestSelling,
  });

  const { products } = response.collection || {};
  const { filters, pageInfo, edges } = products || {};

  const safeFilters = filters || [];
  const safePageInfo = pageInfo || {
    endCursor: null,
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
  };
  const safeSearchParameters = {
    after: searchParameters?.after,
    before: searchParameters?.before,
    sort_key: searchParameters?.sort_key,
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
            <Link href="/collections">
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

  const sortingOptions = [
    {
      label: 'Best Selling',
      name: ProductCollectionSortKeys.BestSelling,
    },
    {
      label: 'Relevance',
      name: ProductCollectionSortKeys.Relevance,
    },
    {
      label: 'Price, low to high',
      name: ProductCollectionSortKeys.Price,
    },

    { label: 'New Arrivals', name: ProductCollectionSortKeys.Created },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
      <ListingHeader>
        <Sort
          query={
            searchParameters?.sort_key
              ? searchParameters
              : { sort_key: ProductCollectionSortKeys.BestSelling }
          }
          sortingOptions={sortingOptions}
        />
        <Filters filters={safeFilters} query={safeSearchParameters} />
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
              <Link href="/collections">Browse All Collections</Link>
            </Button>
          }
          secondaryAction={
            <Link href="/" className="link">
              Go home
            </Link>
          }
        />
      )}
      <PageInfoPagination pageInfo={safePageInfo} searchParameters={safeSearchParameters} />
    </div>
  );
};

export default CollectionSlugPage;
