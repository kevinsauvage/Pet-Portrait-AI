'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

import config from '@/core/config';
import { validateImageDimensions } from '@/domains/ai/ai-portrait/validation';
import { getUploadUrl } from '@/infra/upload/get-upload-url';
import { useUploadThing } from '@/infra/upload/uploadthing';
import { Button } from '@/ui/primitives/button';

import { ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadIsland() {
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing('userUpload', {
    onClientUploadComplete: (res) => {
      const url = getUploadUrl(res?.[0]);
      if (!url) return;
      router.push(`${config.routes.createStyle}?photo=${encodeURIComponent(url)}`);
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
    <div className="mx-auto max-w-xl space-y-4">
      <div
        className={`rounded-2xl border-2 border-dashed transition-all ${
          isDragActive
            ? 'border-primary bg-primary/5 shadow-lg'
            : 'border-border bg-card hover:border-primary/40 hover:shadow-md'
        }`}
      >
        <div
          {...getRootProps()}
          className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-5 p-10"
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-body font-medium text-muted-foreground">Uploading your photo...</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-primary/10 p-5">
                <Upload className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-heading-4">
                  {isDragActive ? 'Drop your photo here' : 'Upload your pet photo'}
                </p>
                <p className="text-body-sm text-muted-foreground">Drag & drop or click to browse</p>
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
    </div>
  );
}
