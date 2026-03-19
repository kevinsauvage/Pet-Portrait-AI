type InventoryInput = {
  availableForSale?: boolean;
  quantityAvailable?: number | null;
  quantity?: number;
};

export const isInventoryTracked = (quantityAvailable?: number | null) =>
  typeof quantityAvailable === 'number' && quantityAvailable > 0;

export const isLowStock = (quantityAvailable?: number | null) =>
  typeof quantityAvailable === 'number' && quantityAvailable > 0 && quantityAvailable < 5;

export const canPurchase = ({ availableForSale, quantityAvailable, quantity }: InventoryInput) => {
  if (!availableForSale) return false;
  if (!isInventoryTracked(quantityAvailable)) return true;
  const trackedQuantity = quantityAvailable ?? 0;
  if (typeof quantity === 'number') {
    return trackedQuantity >= quantity;
  }
  return trackedQuantity > 0;
};
