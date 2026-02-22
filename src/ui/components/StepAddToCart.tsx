'use client';

import Image from 'next/image';
import Link from 'next/link';

import config from '@/core/config';
import { AI_PORTRAIT_PRODUCTS } from '@/domains/ai/ai-portrait/products';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';

import { motion } from 'framer-motion';
import { Download, Frame, Image as ImageIcon, ShoppingCart } from 'lucide-react';

interface ArtworkState {
  urls: string[];
  generationId: string;
  styleId: string;
}

interface StepAddToCartProps {
  selectedArtworkUrl: string;
  artwork: ArtworkState;
  originalPhotoUrl: string;
  onAddToCart: (variantId: string, productType: 'digital' | 'canvas' | 'poster') => Promise<void>;
}

const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  digital: <Download className="h-5 w-5 text-primary" />,
  canvas: <Frame className="h-5 w-5 text-primary" />,
  poster: <ImageIcon className="h-5 w-5 text-primary" />,
};

export default function StepAddToCart({
  selectedArtworkUrl,
  onAddToCart,
}: StepAddToCartProps) {
  const products = [
    AI_PORTRAIT_PRODUCTS.digital,
    AI_PORTRAIT_PRODUCTS.canvas,
    AI_PORTRAIT_PRODUCTS.poster,
  ].filter((p) => p.variantId) as Array<
    (typeof AI_PORTRAIT_PRODUCTS)[keyof typeof AI_PORTRAIT_PRODUCTS]
  >;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
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

            {products.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="text-muted-foreground">
                  Configure AI portrait product variant IDs in your environment variables to enable ordering.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product, i) => (
                  <motion.div
                    key={product.variantId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          {PRODUCT_ICONS[product.productType]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-body">{product.title}</p>
                            {product.productType === 'digital' && (
                              <Badge variant="secondary" className="text-caption-sm">Instant</Badge>
                            )}
                          </div>
                          <p className="text-body-sm text-muted-foreground">{product.description}</p>
                          <p className="text-body-sm font-semibold text-primary mt-1">{product.price}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => onAddToCart(product.variantId, product.productType)}
                        className="shrink-0 gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <Button variant="outline" asChild className="gap-2">
                <Link href={config.routes.cart}>
                  <ShoppingCart className="h-4 w-4" />
                  View Cart
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
