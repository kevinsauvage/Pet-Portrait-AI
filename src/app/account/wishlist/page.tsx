import type { Metadata } from 'next';
import Link from 'next/link';

import NoFavoriteIllustration from '@/assets/NoFavoriteIllustration.png';
import seo from '@/core/config/seo';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';
import CardHeaderPattern from '@/ui/components/CardHeaderPattern';
import EmptyState from '@/ui/components/EmptyState';
import ProductsList from '@/ui/components/ProductsList';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent } from '@/ui/components/ui/card';

import BackButton from '../_components/BackButton';

export const dynamic = 'force-dynamic'; // Wishlist is user-specific

export const metadata: Metadata = {
  description: seo.account.wishlist.description,
  title: seo.account.wishlist.title,
};

const Wishlist = async () => {
  const userWishlist = await WishlistService.getWishlist();

  if (!userWishlist?.length) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            variant="wishlist"
            image={NoFavoriteIllustration}
            title="Your wishlist is empty"
            subtitle="Save your favorite items for later. Click the heart icon on any product to add it to your wishlist."
            altText="Empty wishlist"
            primaryAction={
              <Button variant="default" asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            }
            secondaryAction={
              <Link href="/collections" className="link">
                Browse collections
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
        title={`Wishlist (${userWishlist.length})`}
        size={3}
        actions={<BackButton />}
        description={`You have ${userWishlist.length} ${userWishlist.length === 1 ? 'item' : 'items'} saved in your wishlist.`}
      />
      <CardContent>
        <ProductsList loading={false} layout="grid" products={userWishlist} />
      </CardContent>
    </Card>
  );
};

export default Wishlist;
