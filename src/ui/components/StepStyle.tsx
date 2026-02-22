'use client';

import Image from 'next/image';

import { AI_ART_STYLES, type ArtStyleId } from '@/domains/ai/ai-portrait/types';
import { Button } from '@/ui/components/ui/button';

import { motion } from 'framer-motion';
import { ArrowLeft, Palette } from 'lucide-react';

interface StepStyleProps {
  originalPhotoUrl: string;
  onSelect: (styleId: ArtStyleId) => void;
  onBack: () => void;
  preselectedStyleId?: ArtStyleId | null;
}

export default function StepStyle({
  originalPhotoUrl,
  onSelect,
  onBack,
  preselectedStyleId,
}: StepStyleProps) {
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

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0">
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden border shadow-md">
              <Image
                src={originalPhotoUrl}
                alt="Your pet"
                fill
                className="object-cover"
                sizes="224px"
              />
            </div>
            <p className="text-caption-sm text-muted-foreground mt-3 text-center">Your pet photo</p>
          </div>

          <div className="flex-1">
            <h3 className="text-heading-4 mb-1 flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Choose an art style
            </h3>
            <p className="text-body-sm text-muted-foreground mb-5">
              Select a style to transform your pet into artwork.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AI_ART_STYLES.map((style, i) => (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button
                    onClick={() => onSelect(style.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all text-left group ${
                      preselectedStyleId === style.id ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={style.previewImage}
                        alt={style.label}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-body-sm group-hover:text-primary transition-colors">
                        {style.label}
                      </p>
                      <p className="text-caption-sm text-muted-foreground truncate">
                        {style.description}
                      </p>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
