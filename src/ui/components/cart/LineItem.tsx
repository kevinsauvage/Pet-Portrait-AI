import Link from 'next/link';

import config from '@/core/config';
import { type CartFieldsFragment } from '@/infra/shopify/generated/storefront/index';
import { formatPrice } from '@/lib/format';
import OptimizedImage from '@/ui/components/media/OptimizedImage';
import ProtectedImage from '@/ui/components/media/ProtectedImage';

import CartRemove from './CartRemove';
import QuantityUpdatedContainer from './QuantityUpdatedContainer';

type CartLineNode = CartFieldsFragment['lines']['edges'][number]['node'];

function getAttribute(node: CartLineNode, key: string): string | undefined {
  const attrs = node.attributes;
  return attrs?.find((a) => a.key === key)?.value ?? undefined;
}

const LineItem: React.FC<{ node: CartLineNode }> = ({ node }) => {
  if (!('merchandise' in node)) return null;

  const artworkUrl =
    getAttribute(node, 'printful_print_url') ?? getAttribute(node, 'gelato_print_url');
  const previewUrl =
    getAttribute(node, 'printful_preview_url') ?? getAttribute(node, 'gelato_preview_url');
  const chosenStyle = getAttribute(node, 'chosen_style');
  const generationId = getAttribute(node, 'generation_id');

  const displayImage = previewUrl ?? artworkUrl ?? node.merchandise.image?.medium;

  const isAiPortrait = Boolean(artworkUrl && chosenStyle && generationId);

  const unitPrice =
    typeof node.merchandise.price.amount === 'string'
      ? Number.parseFloat(node.merchandise.price.amount)
      : 0;
  const totalPrice = unitPrice * node.quantity;

  const totalDiscount = node.discountAllocations.reduce(
    (accumulator: number, allocation) =>
      accumulator +
      Number.parseFloat(
        typeof allocation.discountedAmount.amount === 'string'
          ? allocation.discountedAmount.amount
          : '0.00',
      ),
    0,
  );
  const finalPrice = totalPrice - totalDiscount > 0 ? totalPrice - totalDiscount : 0;
  const hasDiscount = finalPrice < totalPrice;
  const { currencyCode } = node.merchandise.price;

  const collectionHandle =
    'product' in node.merchandise && node.merchandise.product?.collections?.nodes?.[0]?.handle;
  const productHandle =
    'product' in node.merchandise && node.merchandise.product?.handle
      ? `${config.routes.collection}/${collectionHandle ?? 'all'}/${node.merchandise.product.handle}`
      : '#';

  return (
    <div className="group relative flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border sm:flex-row sm:items-start sm:gap-5">
      <Link
        href={productHandle}
        className="shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-80"
      >
        {displayImage ? (
          isAiPortrait ? (
            <ProtectedImage
              src={String(displayImage)}
              alt={node.merchandise.product.title}
              width={96}
              height={96}
              quality={75}
              sizes="96px"
              className="h-24 w-24 rounded-lg object-cover"
            />
          ) : (
            <OptimizedImage
              src={String(displayImage)}
              alt={node.merchandise.product.title}
              width={96}
              height={96}
              quality={75}
              sizes="96px"
              className="h-24 w-24 rounded-lg object-cover"
            />
          )
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
            <span className="text-caption-sm text-muted-foreground">No image</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link href={productHandle}>
              <h3 className="line-clamp-2 text-body font-semibold leading-snug tracking-tight hover:text-primary transition-colors">
                {node.merchandise.product.title}
              </h3>
            </Link>
            {node.merchandise.selectedOptions && node.merchandise.selectedOptions.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                {node.merchandise.selectedOptions.map((option: { name: string; value: string }) => (
                  <span key={option.name} className="text-caption text-muted-foreground">
                    {option.name}:{' '}
                    <span className="font-medium text-foreground">{option.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <CartRemove id={node.id} productTitle={node.merchandise.product.title} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <QuantityUpdatedContainer
            originalQuantity={node.quantity}
            quantityAvailable={node.merchandise.quantityAvailable ?? null}
            id={node.id}
            disabled={finalPrice <= 0}
          />
          <div className="text-right">
            <p className="text-body font-semibold tabular-nums">
              {formatPrice(finalPrice, currencyCode)}
            </p>
            {hasDiscount && (
              <p className="text-caption text-muted-foreground line-through tabular-nums">
                {formatPrice(totalPrice, currencyCode)}
              </p>
            )}
            {node.quantity > 1 && (
              <p className="text-caption-sm text-muted-foreground">
                {formatPrice(unitPrice, currencyCode)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineItem;
