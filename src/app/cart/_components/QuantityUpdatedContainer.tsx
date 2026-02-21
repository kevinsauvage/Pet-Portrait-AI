'use client';

import useCartContext from '@/contexts/CartContext/useCartContext';
import QuantityUpdater from '@/ui/components/QuantityUpdater';

const QuantityUpdatedContainer = ({
  originalQuantity,
  quantityAvailable,
  id,
  disabled = false,
}: {
  originalQuantity: number;
  quantityAvailable: number;
  id: string;
  disabled?: boolean;
}) => {
  const { handleQuantityChange } = useCartContext();

  return (
    <QuantityUpdater
      originalQuantity={originalQuantity}
      quantityAvailable={quantityAvailable}
      productId={id}
      onChange={handleQuantityChange}
      disabled={disabled}
    />
  );
};

export default QuantityUpdatedContainer;
