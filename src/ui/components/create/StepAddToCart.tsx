'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import config from '@/core/config';
import {
  AI_PORTRAIT_PRODUCTS,
  PRODUCT_TYPES,
  type ProductType,
} from '@/domains/ai/ai-portrait/products';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';

import { motion } from 'framer-motion';
import {
  Check,
  Download,
  Frame,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Shirt,
  ShoppingCart,
  Sticker,
} from 'lucide-react';
import { toast } from 'sonner';

interface StepAddToCartProps {
  selectedArtworkUrl: string;
  onAddToCart: (variantId: string, productType: ProductType) => Promise<void>;
  onStartOver: () => void;
}

const PRODUCT_DISPLAY: Record<
  ProductType,
  { icon: React.ReactNode; title: string; description: string; badge?: string }
> = {
  digital: {
    icon: <Download className="h-5 w-5 text-primary" />,
    title: 'Digital Download',
    description: 'High-resolution file delivered instantly.',
    badge: 'Instant',
  },
  canvas: {
    icon: <Frame className="h-5 w-5 text-primary" />,
    title: 'Canvas Print',
    description: 'Premium canvas, shipped to your door.',
  },
  poster: {
    icon: <ImageIcon className="h-5 w-5 text-primary" />,
    title: 'Poster / Art Print',
    description: 'High-quality art print, shipped to your door.',
  },
  tshirt: {
    icon: <Shirt className="h-5 w-5 text-primary" />,
    title: 'T-Shirt',
    description: 'High-quality t-shirt, shipped to your door.',
  },
  hoodie: {
    icon: <Shirt className="h-5 w-5 text-primary" />,
    title: 'Hoodie',
    description: 'High-quality hoodie, shipped to your door.',
  },
  sticker: {
    icon: <Sticker className="h-5 w-5 text-primary" />,
    title: 'Sticker',
    description: 'High-quality sticker, shipped to your door.',
  },
};

export default function StepAddToCart({
  selectedArtworkUrl,
  onAddToCart,
  onStartOver,
}: StepAddToCartProps) {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<ProductType | null>(null);
  const [addedType, setAddedType] = useState<ProductType | null>(null);

  const availableProducts = PRODUCT_TYPES.filter((type) => AI_PORTRAIT_PRODUCTS[type].variantId);

  const handleAdd = async (variantId: string, type: ProductType) => {
    if (loadingType) return;
    setLoadingType(type);
    try {
      await onAddToCart(variantId, type);
      setAddedType(type);
      toast.success('Added to cart!', {
        action: {
          label: 'View Cart',
          onClick: () => router.push(config.routes.cart),
        },
      });
    } catch {
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="shrink-0">
            <div className="relative w-full lg:w-80 aspect-square rounded-2xl overflow-hidden border shadow-lg">
              <Image
                src={selectedArtworkUrl}
                alt="Selected portrait"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 320px"
              />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-heading-3 mb-2">Choose Your Product</h3>
              <p className="text-body text-muted-foreground">
                Select how you want to receive your portrait.
              </p>
            </div>

            {availableProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="text-muted-foreground">
                  No products configured yet. Set variant IDs in your environment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableProducts.map((type, i) => {
                  const display = PRODUCT_DISPLAY[type];
                  const { variantId } = AI_PORTRAIT_PRODUCTS[type];
                  const isLoading = loadingType === type;
                  const isAdded = addedType === type;
                  const isDisabled = !!loadingType;

                  return (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border bg-card transition-all ${
                          isAdded
                            ? 'border-green-500/60 bg-green-50/50 dark:bg-green-950/20'
                            : 'hover:border-primary/40 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            {display.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-body">{display.title}</p>
                              {display.badge && (
                                <Badge variant="secondary" className="text-caption-sm">
                                  {display.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-body-sm text-muted-foreground">
                              {display.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAdd(variantId, type)}
                          disabled={isDisabled}
                          variant={isAdded ? 'secondary' : 'default'}
                          className="shrink-0 gap-2 min-w-[130px]"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Adding…
                            </>
                          ) : isAdded ? (
                            <>
                              <Check className="h-4 w-4 text-green-600" />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              {addedType && (
                <Button asChild className="gap-2">
                  <Link href={config.routes.cart}>
                    <ShoppingCart className="h-4 w-4" />
                    View Cart
                  </Link>
                </Button>
              )}
              <Button variant="outline" onClick={onStartOver} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
