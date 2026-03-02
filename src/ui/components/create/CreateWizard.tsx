'use client';

import { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

import { useCart } from '@/contexts/CartContext/useCart';
import type { ProductType } from '@/domains/ai/ai-portrait/products';
import { AI_ART_STYLES, type ArtStyleId } from '@/domains/ai/ai-portrait/types';
import { validateImageDimensions } from '@/domains/ai/ai-portrait/validation';
import { api } from '@/infra/http/api-client';
import { getUploadUrl } from '@/infra/upload/get-upload-url';
import { useUploadThing } from '@/infra/upload/uploadthing';

import StepAddToCart from './StepAddToCart';
import StepGenerating from './StepGenerating';
import StepSelect from './StepSelect';
import StepStyle from './StepStyle';
import StepUpload from './StepUpload';
import { useWizardState, type WizardStep } from './useWizardState';

import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'style', label: 'Style' },
  { id: 'generating', label: 'Generating' },
  { id: 'select', label: 'Select' },
  { id: 'add-to-cart', label: 'Add to Cart' },
];

export default function CreateWizard() {
  const {
    step,
    originalPhotoUrl,
    artwork,
    selectedArtworkUrl,
    styleId,
    preselectedStyleId,
    setOriginalPhotoUrl,
    setArtwork,
    setSelectedArtworkUrl,
    goToStep,
    reset,
  } = useWizardState();

  const { handleAddToCart } = useCart();

  const { startUpload, isUploading } = useUploadThing('userUpload', {
    onClientUploadComplete: (res) => {
      const url = getUploadUrl(res?.[0]);
      if (url) {
        setOriginalPhotoUrl(url);
        goToStep('style');
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

  // Use a ref to track the active generation so stale responses are ignored
  const generationRef = useRef<string | null>(null);

  const handleStyleSelect = useCallback(
    (selectedStyleId: ArtStyleId) => {
      if (!originalPhotoUrl) return;

      const generationToken = crypto.randomUUID();
      generationRef.current = generationToken;

      goToStep('generating');

      api
        .post<{ data: { urls: string[]; generationId: string; styleId: ArtStyleId } }>(
          '/api/ai/generate',
          { originalPhotoUrl, styleId: selectedStyleId },
        )
        .then((res) => {
          if (generationRef.current !== generationToken) return;
          const { data } = res;
          if (!data?.urls) throw new Error('Invalid response');
          setArtwork(data);
        })
        .catch((err) => {
          if (generationRef.current !== generationToken) return;
          toast.error(err?.message ?? 'Generation failed');
          goToStep('style');
        })
        .finally(() => {
          // no-op; navigation handled in success/error branches
        });
    },
    [originalPhotoUrl, goToStep, setArtwork],
  );

  const handleAddToCartWithArtwork = useCallback(
    async (variantId: string, productType: ProductType) => {
      if (!selectedArtworkUrl || !artwork || !originalPhotoUrl) return;

      const styleName =
        AI_ART_STYLES.find((s) => s.id === artwork.styleId)?.name ?? artwork.styleId;

      await handleAddToCart(variantId, 1, [
        { key: 'gelato_print_url', value: selectedArtworkUrl },
        { key: 'original_photo_url', value: originalPhotoUrl },
        { key: 'chosen_style', value: styleName },
        { key: 'generation_id', value: artwork.generationId },
        { key: 'product_type', value: productType },
      ]);
    },
    [selectedArtworkUrl, artwork, originalPhotoUrl, handleAddToCart],
  );

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
              existingPhotoUrl={originalPhotoUrl}
              onContinue={originalPhotoUrl ? () => goToStep('style') : undefined}
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
              onBack={() => goToStep('upload')}
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
            <StepGenerating styleId={styleId} />
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
              onProceed={() => goToStep('add-to-cart')}
              onBack={() => goToStep('style')}
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
              onAddToCart={handleAddToCartWithArtwork}
              onStartOver={reset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
