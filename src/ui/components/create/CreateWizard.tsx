'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSearchParams } from 'next/navigation';

import { useCart } from '@/contexts/CartContext/useCart';
import { AI_ART_STYLES, type ArtStyleId, isValidStyleId } from '@/domains/ai/ai-portrait/types';
import { validateImageDimensions } from '@/domains/ai/ai-portrait/validation';
import { api } from '@/infra/http/api-client';
import { getUploadUrl } from '@/infra/upload/get-upload-url';
import { useUploadThing } from '@/infra/upload/uploadthing';

import StepAddToCart from './StepAddToCart';
import StepGenerating from './StepGenerating';
import StepSelect from './StepSelect';
import StepStyle from './StepStyle';
import StepUpload from './StepUpload';

import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

type WizardStep = 'upload' | 'style' | 'generating' | 'select' | 'add-to-cart';

interface ArtworkState {
  urls: string[];
  generationId: string;
  styleId: ArtStyleId;
}

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'style', label: 'Style' },
  { id: 'generating', label: 'Generating' },
  { id: 'select', label: 'Select' },
  { id: 'add-to-cart', label: 'Add to Cart' },
];

export default function CreateWizard() {
  const searchParams = useSearchParams();
  const styleFromUrl = searchParams.get('style');
  const preselectedStyleId = isValidStyleId(styleFromUrl) ? (styleFromUrl as ArtStyleId) : null;

  const [step, setStep] = useState<WizardStep>('upload');
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<ArtStyleId | null>(null);
  const [artwork, setArtwork] = useState<ArtworkState | null>(null);
  const [selectedArtworkUrl, setSelectedArtworkUrl] = useState<string | null>(null);

  const { handleAddToCart } = useCart();
  const { startUpload, isUploading } = useUploadThing('userUpload', {
    onClientUploadComplete: (res) => {
      const url = getUploadUrl(res?.[0]);
      if (url) {
        setOriginalPhotoUrl(url);
        setStep('style');
      }
    },
    onUploadError: (err) => {
      toast.error(err.message ?? 'Upload failed');
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const dimCheck = await validateImageDimensions(file);
      if (!dimCheck.valid) {
        toast.error(dimCheck.error);
        return;
      }

      startUpload([file]);
    },
    [startUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 8 * 1024 * 1024,
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleStyleSelect = (styleId: ArtStyleId) => {
    setSelectedStyleId(styleId);
    setStep('generating');

    api
      .post<{ data: { urls: string[]; generationId: string; styleId: ArtStyleId } }>(
        '/api/ai/generate',
        { originalPhotoUrl, styleId },
      )
      .then((res) => {
        const { data } = res;
        if (!data?.urls) throw new Error('Invalid response');
        setArtwork(data);
        setStep('select');
      })
      .catch((err) => {
        toast.error(err?.message ?? 'Generation failed');
        setStep('style');
      });
  };

  const handleProceedToCart = () => {
    if (!selectedArtworkUrl || !artwork) return;
    setStep('add-to-cart');
  };

  const handleAddToCartWithArtwork = async (
    variantId: string,
    productType: 'digital' | 'canvas' | 'poster',
  ) => {
    if (!selectedArtworkUrl || !artwork || !originalPhotoUrl) return;

    const styleName = AI_ART_STYLES.find((s) => s.id === artwork.styleId)?.name ?? artwork.styleId;

    const attributes = [
      { key: 'original_photo_url', value: originalPhotoUrl },
      { key: 'final_artwork_url', value: selectedArtworkUrl },
      { key: 'chosen_style', value: styleName },
      { key: 'generation_id', value: artwork.generationId },
      { key: 'product_type', value: productType },
    ];

    try {
      await handleAddToCart(variantId, 1, attributes);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="space-y-8">
      <nav className="flex items-center justify-center gap-6" aria-label="Progress">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-caption-sm font-semibold transition-all ${
                i < currentStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : i === currentStepIndex
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < currentStepIndex ? '\u2713' : i + 1}
            </div>
            <span
              className={`hidden sm:inline text-caption-sm font-medium ${
                i <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StepUpload
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              isUploading={isUploading}
            />
          </motion.div>
        )}

        {step === 'style' && originalPhotoUrl && (
          <motion.div
            key="style"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StepStyle
              originalPhotoUrl={originalPhotoUrl}
              onSelect={handleStyleSelect}
              onBack={() => setStep('upload')}
              preselectedStyleId={preselectedStyleId}
            />
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StepGenerating styleId={selectedStyleId} />
          </motion.div>
        )}

        {step === 'select' && artwork && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StepSelect
              urls={artwork.urls}
              selectedUrl={selectedArtworkUrl}
              onSelect={setSelectedArtworkUrl}
              onProceed={handleProceedToCart}
              onBack={() => setStep('style')}
              disabled={!selectedArtworkUrl}
            />
          </motion.div>
        )}

        {step === 'add-to-cart' && artwork && selectedArtworkUrl && (
          <motion.div
            key="add-to-cart"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StepAddToCart
              selectedArtworkUrl={selectedArtworkUrl}
              artwork={artwork}
              originalPhotoUrl={originalPhotoUrl ?? ''}
              onAddToCart={handleAddToCartWithArtwork}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
