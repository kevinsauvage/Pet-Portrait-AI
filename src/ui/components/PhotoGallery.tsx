'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';

import OptimizedImage from './OptimizedImage';

type PhotoGalleryProps = {
  images: ImageFields[];
  className?: string;
};

const PhotoGallery = ({ images, className }: PhotoGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!images || images.length <= 1) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images]);

  const handleImageChange = (index: number) => {
    if (index === selectedImageIndex) return;
    setIsTransitioning(true);
    setSelectedImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  if (!images || images.length === 0) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative aspect-square w-full rounded-lg border-2 border-border bg-muted overflow-hidden">
          <OptimizedImage
            src=""
            alt="No product images available"
            width={800}
            height={800}
            fill
            quality={75}
            className="object-cover"
          />
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex] || images[0];
  const hasMultipleImages = images.length > 1;
  const maxThumbnails = 5;

  // Determine which thumbnail range to show when there are many images
  const getThumbnailRange = () => {
    if (images.length <= maxThumbnails) {
      return { range: images, startIndex: 0 };
    }

    // Show thumbnails centered around the selected image when possible
    let start = selectedImageIndex - Math.floor(maxThumbnails / 2);

    // Adjust if we're near the beginning
    if (start < 0) {
      start = 0;
    }

    // Adjust if we're near the end
    if (start + maxThumbnails > images.length) {
      start = images.length - maxThumbnails;
    }

    return {
      range: images.slice(start, start + maxThumbnails),
      startIndex: start,
    };
  };

  const { range: thumbnailRange, startIndex: thumbnailStartIndex } = hasMultipleImages
    ? getThumbnailRange()
    : { range: [], startIndex: 0 };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image Container */}
      <div className="relative aspect-square w-full rounded-lg border border-border bg-background overflow-hidden group">
        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border/50">
            <span className="text-body-sm font-medium text-foreground">
              {selectedImageIndex + 1} / {images.length}
            </span>
          </div>
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                handleImageChange(
                  selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1,
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 border border-border/50 hover:bg-background hover:border-border transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Previous image"
            >
              <svg
                className="w-5 h-5 text-foreground"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() =>
                handleImageChange(
                  selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0,
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 border border-border/50 hover:bg-background hover:border-border transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Next image"
            >
              <svg
                className="w-5 h-5 text-foreground"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Main Image */}
        <OptimizedImage
          key={`main-image-${selectedImageIndex}`}
          src={selectedImage?.large || selectedImage?.src || ''}
          alt={
            selectedImage?.altText ?? `Product image ${selectedImageIndex + 1} of ${images.length}`
          }
          width={selectedImage?.width || 1000}
          height={selectedImage?.height || 1000}
          blurDataURL={selectedImage?.blurDataURL}
          priority={selectedImageIndex === 0}
          quality={80}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
          fill
          className={cn(
            'object-cover transition-all duration-300 group-hover:scale-105',
            isTransitioning && 'opacity-70',
          )}
        />
      </div>

      {/* Thumbnail Grid */}
      {hasMultipleImages && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {thumbnailRange.map((image, localIndex) => {
            const globalIndex = thumbnailStartIndex + localIndex;
            const isSelected = globalIndex === selectedImageIndex;

            return (
              <button
                key={`thumbnail-${globalIndex}`}
                type="button"
                onClick={() => handleImageChange(globalIndex)}
                className={cn(
                  'relative aspect-square rounded-md border-2 overflow-hidden transition-all',
                  'hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-transparent hover:opacity-80',
                )}
                aria-label={`View product image ${globalIndex + 1} of ${images.length}`}
                aria-current={isSelected ? 'true' : 'false'}
              >
                <OptimizedImage
                  src={image.small || image.medium || image.src}
                  alt={image.altText || `Product thumbnail ${globalIndex + 1}`}
                  width={150}
                  height={150}
                  blurDataURL={image.blurDataURL}
                  quality={70}
                  sizes="(max-width: 640px) 25vw, 20vw"
                  fill
                  className="object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 ring-2 ring-primary ring-inset pointer-events-none z-10" />
                )}
              </button>
            );
          })}

          {/* Show indicator if there are more images beyond what's displayed */}
          {images.length > maxThumbnails && (
            <button
              type="button"
              onClick={() => {
                // Scroll to show more images - could be enhanced with a modal or scroll
                const nextIndex = Math.min(selectedImageIndex + maxThumbnails, images.length - 1);
                handleImageChange(nextIndex);
              }}
              className="relative aspect-square rounded-md border-2 border-border bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`View more images (${images.length - maxThumbnails} more)`}
            >
              <span className="text-body-sm text-secondary font-medium">
                +{images.length - maxThumbnails}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
