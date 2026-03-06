import type { Metadata } from 'next';
import Link from 'next/link';

import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { COLLECTION_SORT_OPTIONS } from '@/domains/collections/constants/sort-options';
import {
  getCollectionPageData,
  getCollectionSeo,
} from '@/domains/collections/services/collections.service';
import ListingHeader from '@/ui/components/catalog/ListingHeader';
import PageInfoPagination from '@/ui/components/catalog/PageInfoPagination';
import ProductEdgeList from '@/ui/components/catalog/ProductsEdgeList';
import Sort from '@/ui/components/catalog/Sort';
import EmptyState from '@/ui/components/shared/EmptyState';
import { Button } from '@/ui/primitives/button';

export const revalidate = 3600;

type ParametersType = { collectionSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<ParametersType>;
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
    sort_key?: string;
    reverse?: boolean;
  }>;
}) => {
  const { collectionSlug } = await params;
  const searchParameters = (await searchParams) || {};

  const { edges, pageInfo, sortKey } = await getCollectionPageData(
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
      <EmptyState
        variant="default"
        title="No products found"
        subtitle="This collection is empty. Browse other collections to find what you're looking for."
        altText="No products found"
        primaryAction={
          <Button variant="default" asChild>
            <Link href="/shop">Browse Collections</Link>
          </Button>
        }
        secondaryAction={
          <Link href="/" className="link">
            Go home
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <ListingHeader>
        <Sort
          query={searchParameters?.sort_key ? searchParameters : { sort_key: sortKey }}
          sortingOptions={COLLECTION_SORT_OPTIONS}
        />
      </ListingHeader>

      <ProductEdgeList products={edges} layout="grid" collectionSlug={collectionSlug} />

      <PageInfoPagination pageInfo={pageInfo} searchParameters={safeSearchParameters} pathname={`/shop/${collectionSlug}`} />
    </div>
  );
};

export default CollectionSlugPage;
