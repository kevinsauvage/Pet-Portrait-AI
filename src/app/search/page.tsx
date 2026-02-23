import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { type SearchParameters, searchProducts } from '@/domains/search/services/search.service';
import { SEARCH_SORT_OPTIONS } from '@/infra/shopify/sort-options';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import EmptyState from '@/ui/components/EmptyState';
import Filters from '@/ui/components/Filters';
import ListingHeader from '@/ui/components/ListingHeader';
import PageBanner from '@/ui/components/PageBanner';
import PageInfoPagination from '@/ui/components/PageInfoPagination';
import ProductsList from '@/ui/components/ProductsList';
import Search from '@/ui/components/Search';
import Sort from '@/ui/components/Sort';
import { Button } from '@/ui/components/ui/button';

export const revalidate = 300;

export const metadata: Metadata = generateMetadataUtil({
  title: seo.search.title,
  description: seo.search.description,
  url: config.routes.search,
});

const Page = async ({ searchParams }: { searchParams: Promise<SearchParameters> }) => {
  const searchParameters = await searchParams;
  const { products, filters, pageInfo, sortKey } = await searchProducts(searchParameters);

  return (
    <div>
      <PageBanner title={seo.search.title} description={seo.search.description}>
        <div className="space-y-6">
          <Breadcrumbs />
          <Search searchQuery={searchParameters.searchQuery} />
        </div>
      </PageBanner>
      {products.length > 0 ? (
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
          <ListingHeader>
            <Sort
              query={{ sort_key: searchParameters?.sort_key || sortKey }}
              sortingOptions={SEARCH_SORT_OPTIONS}
            />
            <Filters filters={filters} query={searchParameters} />
          </ListingHeader>
          <ProductsList layout="grid" products={products} ariaLabel="Search results" />
          <PageInfoPagination pageInfo={pageInfo} searchParameters={searchParameters} />
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
          <EmptyState
            variant="search"
            title="No results found"
            subtitle="We couldn't find any products matching your search. Try different keywords or browse our collections."
            altText="No search results"
            primaryAction={
              <Button variant="default" asChild>
                <Link href="/shop">Browse Collections</Link>
              </Button>
            }
            secondaryAction={
              <Link href="/" className="link">
                Clear search and try again
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
};

export default Page;
