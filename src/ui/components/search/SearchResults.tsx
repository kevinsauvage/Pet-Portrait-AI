import Link from 'next/link';

import type { PredictiveSearchQuery } from '@/infra/shopify/storefront';
import { formatPrice } from '@/lib/format';
import OptimizedImage from '@/ui/components/media/OptimizedImage';

import { Search } from 'lucide-react';

type ProductSearchItem = {
  id: string;
  featuredImage?: {
    url?: string;
    src?: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  title?: string;
  handle?: string;
  priceRange?: { minVariantPrice: { amount: string; currencyCode: string } };
  collections?: { edges?: Array<{ node?: { handle?: string } }> };
};

const Product = ({ product }: { product: ProductSearchItem }) => {
  const { featuredImage, title, handle, priceRange, collections } = product;
  const collectionSlug = collections?.edges?.[0]?.node?.handle ?? 'all';

  if (!featuredImage) return null;

  // featuredImage is already an Image type, not an edge
  const imageUrl = String(
    (featuredImage as { url?: string; src?: string }).url ||
      (featuredImage as { url?: string; src?: string }).src ||
      '',
  );
  const image = {
    altText: (featuredImage as { altText?: string | null }).altText ?? null,
    blurDataURL: '',
    height: (featuredImage as { height?: number | null }).height ?? null,
    large: imageUrl,
    medium: imageUrl,
    small: imageUrl,
    src: imageUrl,
    width: (featuredImage as { width?: number | null }).width ?? null,
  };

  if (!image.src) return null;

  return (
    <Link
      key={handle}
      href={`/shop/${collectionSlug}/${handle}`}
      role="option"
      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <OptimizedImage
        src={image.small}
        alt={image.altText || ''}
        width={48}
        height={48}
        quality={75}
        sizes="48px"
        className="rounded-lg aspect-square object-contain"
      />
      <div className="flex flex-col items-start">
        <span className="text-body font-semibold">{title}</span>

        {priceRange?.minVariantPrice && (
          <span className="text-body-sm text-secondary">
            {formatPrice(
              priceRange.minVariantPrice.amount,
              priceRange.minVariantPrice.currencyCode,
            )}
          </span>
        )}
      </div>
    </Link>
  );
};

const Query = ({ query }: { query: { text: string } }) => {
  return (
    <Link
      key={query.text}
      href={`/search?searchQuery=${query.text}`}
      role="option"
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-body font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Search className="h-4 w-4 text-secondary" />
      {query.text}
    </Link>
  );
};

const SectionTitle = ({ title }: { title: string }) => {
  return <div className="px-4 pt-4 text-label-sm text-secondary">{title}</div>;
};

const SearchResults = ({
  results,
  id,
}: {
  results: PredictiveSearchQuery['predictiveSearch'] | null | undefined;
  id?: string;
}) => {
  if (!results) {
    return null;
  }

  const resultsData = results as {
    products?: Array<{ id: string }>;
    queries?: Array<{ text: string }>;
  };
  const products = resultsData.products || [];
  const queries = resultsData.queries || [];

  if (products.length === 0 && queries.length === 0) {
    return null;
  }

  return (
    <div
      id={id}
      role="listbox"
      aria-label="Search suggestions"
      className="absolute z-50 w-full mt-2 rounded-xl border border-border bg-background shadow-lg text-start overflow-hidden animate-fadeSlideDown"
    >
      <div className="p-2">
        {queries.length > 0 && (
          <>
            <SectionTitle title="Suggestions" />
            <div className="pb-4">
              {queries.map((q) => (
                <Query key={q.text} query={{ text: q.text }} />
              ))}
            </div>
          </>
        )}

        {products.length > 0 && (
          <>
            <SectionTitle title="Products" />
            <div className="pb-4">
              {products.map((product) => (
                <Product key={product.id} product={product as ProductSearchItem} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
