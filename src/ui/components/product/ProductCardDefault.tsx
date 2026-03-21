import Link from 'next/link';

import config from '@/core/config';
import { mapShopifyImagesToImageFields } from '@/domains/products/images';
import { isLowStock } from '@/domains/products/inventory';
import type { ProductFieldsFragment } from '@/infra/shopify/generated/storefront/index';
import OptimizedImage from '@/ui/components/media/OptimizedImage';
import { Badge } from '@/ui/primitives/badge';

import Price from './Price';

import { Sparkles } from 'lucide-react';

const isWhatPercentOf = (x: number, y: number) => (((x - y) / y) * 100).toFixed(0);

type ProductCardDefaultProps = {
  product: ProductFieldsFragment;
  priority: boolean;
  asListItem?: boolean;
  /** When provided, links to /shop/{collectionSlug}/{productHandle}. Otherwise uses product's first collection or "all". */
  collectionSlug?: string;
};

function getProductCollectionSlug(
  product: ProductFieldsFragment,
  explicitSlug?: string,
): string {
  if (explicitSlug) return explicitSlug;
  return product.collections?.edges?.[0]?.node?.handle ?? 'all';
}

const ProductCardDefault = ({
  product,
  priority,
  asListItem = true,
  collectionSlug,
}: ProductCardDefaultProps) => {
  const { title, images, handle, variants, priceRange } = product;
  const resolvedCollectionSlug = getProductCollectionSlug(product, collectionSlug);
  const { price, compareAtPrice, availableForSale, quantityAvailable } =
    variants?.edges?.[0]?.node || {};

  const productImages = mapShopifyImagesToImageFields(images?.edges);
  const primaryImage = productImages?.[0];

  const lowStock = isLowStock(quantityAvailable) && availableForSale;
  const isSoldOut = !availableForSale;
  const hasDiscount =
    compareAtPrice && price?.amount !== compareAtPrice?.amount;

  const Component = asListItem ? 'li' : 'div';

  return (
    <Component className="group">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="absolute right-3 top-3 z-20 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={config.routes.create}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-background/95 px-3 py-2 text-caption-sm font-semibold text-primary shadow-lg backdrop-blur-sm transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <Sparkles className="h-3 w-3" />
            Create
          </Link>
        </div>

        <Link
          className="flex h-full flex-col"
          href={`${config.routes.collection}/${resolvedCollectionSlug}/${handle}`}
          scroll
          aria-label={`View details for ${title}`}
        >
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            <OptimizedImage
              src={primaryImage?.medium || primaryImage?.small || primaryImage?.src || ''}
              alt={primaryImage?.altText || title}
              width={520}
              height={520}
              blurDataURL={primaryImage?.blurDataURL}
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
              quality={75}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />

            <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
              {hasDiscount && (
                <Badge
                  variant="destructive"
                  className="text-caption-sm font-bold shadow-md"
                >
                  -{isWhatPercentOf(Number(price?.amount), Number(compareAtPrice?.amount))}%
                </Badge>
              )}
              {isSoldOut && (
                <Badge variant="destructive" className="text-caption-sm font-bold shadow-md">
                  Sold Out
                </Badge>
              )}
              {lowStock && !isSoldOut && (
                <Badge variant="secondary" className="text-caption-sm font-bold shadow-md">
                  Low Stock
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3.5">
            <div className="flex-1 space-y-0.5">
              <p className="line-clamp-2 text-body font-semibold leading-snug tracking-tight">
                {title}
              </p>
              <p className="text-caption text-muted-foreground">Custom pet portrait</p>
            </div>
            <Price
              compareAtPrice={compareAtPrice}
              priceRange={priceRange}
              price={price}
            />
          </div>
        </Link>
      </article>
    </Component>
  );
};

export default ProductCardDefault;
