'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/cn';
import { Badge } from '@/ui/primitives/badge';
import { Slider } from '@/ui/primitives/slider';

type BeforeAfterImage = {
  src: string;
  alt: string;
  label: string;
};

type BeforeAfterPreviewProps = {
  before: BeforeAfterImage;
  after: BeforeAfterImage;
  className?: string;
  caption?: string;
  priority?: boolean;
  initial?: number;
  sizes?: string;
  aspectClassName?: string;
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

const BeforeAfterPreview = ({
  before,
  after,
  className,
  caption,
  priority = false,
  initial = 55,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw',
  aspectClassName = 'aspect-[4/3]',
}: BeforeAfterPreviewProps) => {
  const [value, setValue] = useState(() => clamp(initial));
  const sliderValue = useMemo(() => [value], [value]);

  return (
    <div className={cn('w-full', className)}>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/50 shadow-md">
        <div className={cn('relative w-full', aspectClassName)}>
          <Image
            src={after.src}
            alt={after.alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${value}%` }}
          >
            <Image
              src={before.src}
              alt={before.alt}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover"
            />
          </div>
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{ left: `calc(${value}% - 1px)` }}
            aria-hidden="true"
          >
            <div className="h-full w-0.5 bg-white/80 shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-10 w-10 rounded-full border border-white/70 bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center">
                <div className="flex gap-1">
                  <span className="h-3 w-0.5 rounded-full bg-muted-foreground/70" />
                  <span className="h-3 w-0.5 rounded-full bg-muted-foreground/70" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute left-4 top-4">
            <Badge variant="secondary">{before.label}</Badge>
          </div>
          <div className="absolute right-4 top-4">
            <Badge variant="secondary">{after.label}</Badge>
          </div>
        </div>
        <div className="px-4 pb-4 pt-3">
          <Slider
            value={sliderValue}
            min={0}
            max={100}
            onValueChange={(nextValue) => {
              if (!Array.isArray(nextValue)) return;
              setValue(clamp(nextValue[0] ?? 50));
            }}
            aria-label="Reveal before and after image"
          />
        </div>
      </div>
      {caption ? (
        <p className="mt-3 text-body-sm text-muted-foreground">{caption}</p>
      ) : null}
    </div>
  );
};

export default BeforeAfterPreview;
