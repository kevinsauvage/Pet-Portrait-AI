'use client';

import type { SavedPortrait } from '@/domains/wishlist/services/wishlist.service';

import SavedPortraitCard from './SavedPortraitCard';

type DefaultProduct = {
  product: { handle: string; gelatoProductUid?: string };
  variant: { id: string; availableForSale: boolean };
};

type Props = {
  portraits: SavedPortrait[];
  defaultProduct?: DefaultProduct | null;
};

const SavedPortraitsList = ({ portraits, defaultProduct }: Props) => {
  if (portraits.length === 0) {
    return (
      <p className="text-body text-muted-foreground text-center py-8">
        No saved portraits remaining.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {portraits.map((portrait) => (
        <SavedPortraitCard
          key={portrait.id}
          portrait={portrait}
          defaultProduct={defaultProduct}
        />
      ))}
    </div>
  );
};

export default SavedPortraitsList;
