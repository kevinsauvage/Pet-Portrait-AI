export type SavedPortrait = {
  id: string;
  imageUrl: string;
  originalPhotoUrl: string;
  styleId: string;
  generationId: string;
  label?: string;
  savedAt: string;
  /** When saved from cart: variant and product info for one-click add back */
  variantId?: string;
  productHandle?: string;
};

export type WishlistData = SavedPortrait[];
