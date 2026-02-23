'use client';

import Image from 'next/image';

import { Button } from '@/ui/primitives/button';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface StepSelectProps {
  urls: string[];
  selectedUrl: string | null;
  onSelect: (url: string) => void;
  onProceed: () => void;
  onBack: () => void;
  disabled: boolean;
}

export default function StepSelect({
  urls,
  selectedUrl,
  onSelect,
  onProceed,
  onBack,
  disabled,
}: StepSelectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div>
          <h3 className="text-heading-3 mb-2">Choose Your Favorite</h3>
          <p className="text-body text-muted-foreground mb-8">
            Select the portrait you love most. You can order it as a digital download or premium print.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {urls.map((url, i) => {
              const isSelected = selectedUrl === url;
              return (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => onSelect(url)}
                    className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                      isSelected
                        ? 'border-primary ring-4 ring-primary/20 shadow-lg'
                        : 'border-border hover:border-primary/40 hover:shadow-md'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Variation ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/15 flex items-center justify-center">
                        <div className="rounded-full bg-primary p-2 shadow-lg">
                          <Check className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-caption-sm font-medium">
                      #{i + 1}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          <Button size="lg" onClick={onProceed} disabled={disabled} className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
