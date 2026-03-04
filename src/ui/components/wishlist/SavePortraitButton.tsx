'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import useCartContext from '@/contexts/CartContext/useCartContext';
import { savePortraitToWishlist } from '@/domains/wishlist/client';
import { Button } from '@/ui/primitives/button';

import { Heart, Loader2 } from 'lucide-react';

type Props = {
  imageUrl: string;
  originalPhotoUrl: string;
  styleId: string;
  generationId: string;
  label?: string;
  className?: string;
  lineItemId?: string;
  /** When saving from cart: pass variant info so we can add back with same product */
  variantId?: string;
  productHandle?: string;
  gelatoProductUid?: string;
};

const SavePortraitButton = ({
  imageUrl,
  originalPhotoUrl,
  styleId,
  generationId,
  label,
  className,
  lineItemId,
  variantId,
  productHandle,
  gelatoProductUid,
}: Props) => {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { removeFromCart } = useCartContext();

  const handleSave = async () => {
    if (status === 'saved' || status === 'loading') return;

    setStatus('loading');
    setErrorMsg(null);

    const result = await savePortraitToWishlist({
      imageUrl,
      originalPhotoUrl,
      styleId,
      generationId,
      label,
      ...(variantId && productHandle && {
        variantId,
        productHandle,
        gelatoProductUid,
      }),
    });

    const isDuplicate = result.message?.toLowerCase().includes('already');

    if (result.success || isDuplicate) {
      setStatus('saved');
      if (lineItemId) await removeFromCart(lineItemId);
      router.refresh();
    } else {
      setStatus('error');
      setErrorMsg(result.message ?? 'Could not save portrait');
      setTimeout(() => {
        setStatus('idle');
        setErrorMsg(null);
      }, 3000);
    }
  };

  const isSaved = status === 'saved';

  return (
    <div className={className}>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleSave}
        disabled={status === 'loading' || isSaved}
        className="gap-2 w-full justify-center"
        aria-label={isSaved ? 'Saved for later' : 'Save for later'}
      >
        {status === 'loading' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Heart className="h-3.5 w-3.5" fill={isSaved ? 'currentColor' : 'none'} />
        )}
        {isSaved ? 'Saved for later' : status === 'loading' ? 'Adding…' : 'Save for later'}
      </Button>
      {errorMsg && (
        <p className="text-caption-sm text-destructive mt-1">{errorMsg}</p>
      )}
    </div>
  );
};

export default SavePortraitButton;
