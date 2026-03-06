'use client';

import { useEffect, useRef } from 'react';
import Image, { type ImageProps } from 'next/image';

import { cn } from '@/lib/utils';

type ProtectedImageProps = ImageProps & {
  className?: string;
  imageClassName?: string;
};

/**
 * ProtectedImage component that prevents users from downloading images
 * by disabling right-click, drag, and selection.
 */
const ProtectedImage = ({ className, imageClassName, ...imageProps }: ProtectedImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent drag start
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Prevent image selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    // Add event listeners
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('selectstart', handleSelectStart);

    // Cleanup
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  const hasFill = imageProps.fill === true;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative select-none',
        hasFill && 'w-full h-full',
        '[&_img]:select-none [&_img]:pointer-events-none [&_img]:user-select-none',
        '[&_img]:[-webkit-user-select:none] [&_img]:[-moz-user-select:none]',
        '[&_img]:[-ms-user-select:none] [&_img]:[-khtml-user-select:none]',
        className,
      )}
      style={{
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Transparent overlay to prevent direct interaction */}
      <div
        className="absolute inset-0 z-10 cursor-default"
        style={{ pointerEvents: 'auto' }}
        aria-hidden="true"
      />
      <Image {...imageProps} draggable={false} className={cn('object-cover', imageClassName)} />
    </div>
  );
};

export default ProtectedImage;
