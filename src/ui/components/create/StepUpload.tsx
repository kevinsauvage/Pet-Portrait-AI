'use client';

import { Button } from '@/ui/primitives/button';

import { motion } from 'framer-motion';
import { ImageIcon, Upload } from 'lucide-react';

interface StepUploadProps {
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
  isUploading: boolean;
}

export default function StepUpload({
  getRootProps,
  getInputProps,
  isDragActive,
  isUploading,
}: StepUploadProps) {
  return (
    <div className="mx-auto max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
      <div className={`rounded-2xl border-2 border-dashed transition-all ${
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
    </div>
  );
}
