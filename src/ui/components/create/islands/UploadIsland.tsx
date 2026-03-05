'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

import config from '@/core/config';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { validateImageDimensions } from '@/domains/ai/ai-portrait/validation';
import { getUploadUrl } from '@/infra/upload/get-upload-url';
import { useUploadThing } from '@/infra/upload/uploadthing';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/primitives/button';

import { ImageIcon, Sparkles, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface UploadIslandProps {
  initialStyleId?: string;
}

export default function UploadIsland({ initialStyleId }: UploadIslandProps) {
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing('userUpload', {
    onClientUploadComplete: (res) => {
      const url = getUploadUrl(res?.[0]);
      if (!url) return;
      const queryString = buildCreateFlowQueryString({
        photo: url,
        styleId: initialStyleId,
      });
      router.push(`${config.routes.createStyle}${queryString}`);
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

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-heading-3 font-semibold">Start Your Portrait Journey</h2>
        <p className="text-body text-muted-foreground max-w-lg mx-auto">
          Upload a clear photo of your pet and watch AI transform it into stunning artwork
        </p>
      </div>

      <div
        className={cn(
          'relative rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden',
          isDragActive
            ? 'border-primary bg-primary/5 shadow-2xl scale-[1.02]'
            : 'border-border/60 bg-gradient-to-br from-card via-card to-muted/20 hover:border-primary/50 hover:shadow-xl',
          isUploading && 'pointer-events-none',
        )}
      >
        {/* Animated background gradient on drag */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent animate-pulse" />
        )}

        <div
          {...getRootProps()}
          className={cn(
            'relative flex min-h-[400px] cursor-pointer flex-col items-center justify-center gap-6 p-12',
            'transition-all duration-300',
            isDragActive && 'scale-[1.01]',
          )}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-heading-4 font-semibold">Uploading your photo...</p>
                <p className="text-body-sm text-muted-foreground">This will only take a moment</p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  'relative rounded-3xl p-6 transition-all duration-300',
                  isDragActive
                    ? 'bg-primary/20 scale-110 shadow-lg'
                    : 'bg-gradient-to-br from-primary/10 via-primary/5 to-primary/5',
                )}
              >
                <Upload
                  className={cn(
                    'h-12 w-12 text-primary transition-all duration-300',
                    isDragActive && 'scale-110',
                  )}
                  strokeWidth={1.5}
                />
                {isDragActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 animate-ping" />
                  </div>
                )}
              </div>

              <div className="space-y-3 text-center max-w-md">
                <h3 className="text-heading-4 font-semibold">
                  {isDragActive ? (
                    <span className="text-primary">Drop your photo here</span>
                  ) : (
                    'Upload your pet photo'
                  )}
                </h3>
                <p className="text-body text-muted-foreground">
                  {isDragActive
                    ? 'Release to upload'
                    : 'Drag & drop your photo here, or click to browse files'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-caption-sm text-muted-foreground">
                    JPEG, PNG, WebP
                  </span>
                  <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-caption-sm text-muted-foreground">
                    Max 8MB
                  </span>
                  <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-caption-sm text-muted-foreground">
                    Min 200px
                  </span>
                </div>
              </div>

              <Button
                variant={isDragActive ? 'default' : 'outline'}
                size="lg"
                className={cn(
                  'mt-4 gap-2 transition-all duration-300',
                  isDragActive && 'shadow-lg scale-105',
                )}
              >
                <ImageIcon className="h-4 w-4" />
                Choose File
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tips section */}
      {!isUploading && (
        <div className="rounded-2xl bg-muted/50 border border-border/50 p-6">
          <h4 className="text-body-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Tips for best results
          </h4>
          <ul className="space-y-2 text-body-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Use a clear, well-lit photo with good contrast</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Make sure your pet is the main focus of the image</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Higher resolution photos produce better results</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
