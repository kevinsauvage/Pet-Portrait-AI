'use client';

import Image from 'next/image';

import { Button } from '@/ui/primitives/button';

import { motion } from 'framer-motion';
import { ArrowRight, ImageIcon, RefreshCw, Upload } from 'lucide-react';

interface StepUploadProps {
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
  isUploading: boolean;
  existingPhotoUrl?: string | null;
  onContinue?: () => void;
}

export default function StepUpload({
  getRootProps,
  getInputProps,
  isDragActive,
  isUploading,
  existingPhotoUrl,
  onContinue,
}: StepUploadProps) {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div
          className={`rounded-2xl border-2 border-dashed transition-all ${
            isDragActive
              ? 'border-primary bg-primary/5 shadow-lg'
              : 'border-border bg-card hover:border-primary/40 hover:shadow-md'
          }`}
        >
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center gap-5 cursor-pointer min-h-[320px] p-10"
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-14 w-14 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-body text-muted-foreground font-medium">Uploading your photo...</p>
              </div>
            ) : existingPhotoUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border shadow-md">
                  <Image
                    src={existingPhotoUrl}
                    alt="Your uploaded photo"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-body font-medium">Photo uploaded</p>
                  <p className="text-body-sm text-muted-foreground flex items-center gap-1.5 justify-center">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Drop or click to replace
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-primary/10 p-5">
                  <Upload className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-heading-4">
                    {isDragActive ? 'Drop your photo here' : 'Upload your pet photo'}
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-caption-sm text-muted-foreground">
                    JPEG, PNG, WebP &middot; Max 8MB &middot; Min 200px
                  </p>
                </div>
                <Button variant="outline" size="lg" className="mt-2 gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Choose File
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {existingPhotoUrl && onContinue && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex justify-end"
        >
          <Button onClick={onContinue} className="gap-2">
            Continue with this photo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
