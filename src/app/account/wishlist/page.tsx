import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { getDefaultAiPortraitProduct } from '@/domains/ai/ai-portrait/get-ai-portrait-product.service';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';
import { noFavoriteIllustration } from '@/lib/illustrations';
import SavedPortraitsList from '@/ui/components/account/SavedPortraitsList';
import BackButton from '@/ui/components/shared/BackButton';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import EmptyState from '@/ui/components/shared/EmptyState';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent } from '@/ui/primitives/card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description: seo.account.wishlist.description,
  title: seo.account.wishlist.title,
};

const WishlistPage = async () => {
  const [savedPortraits, defaultProduct] = await Promise.all([
    WishlistService.getWishlist(),
    getDefaultAiPortraitProduct(),
  ]);

  if (!savedPortraits.length) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            variant="wishlist"
            image={noFavoriteIllustration}
            title="No saved portraits yet"
            subtitle="When you generate portraits, tap the heart icon to save your favourites here. Then order them anytime."
            altText="No saved portraits"
            primaryAction={
              <Button variant="default" asChild>
                <Link href={config.routes.create}>Create a portrait</Link>
              </Button>
            }
            secondaryAction={
              <Link href={config.routes.creations} className="link">
                View my creations
              </Link>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeaderPattern
        title={`Saved Portraits (${savedPortraits.length})`}
        size={3}
        actions={<BackButton />}
        description={`You have ${savedPortraits.length} saved portrait${savedPortraits.length === 1 ? '' : 's'}. Click any portrait to order it as a print or digital download.`}
      />
      <CardContent>
        <SavedPortraitsList
          portraits={savedPortraits}
          defaultProduct={
            defaultProduct
              ? {
                  product: { handle: defaultProduct.product.handle },
                  variant: defaultProduct.variant,
                }
              : null
          }
        />
      </CardContent>
    </Card>
  );
};

export default WishlistPage;
