'use client';

import { AI_ART_STYLES, type ArtStyleId } from '@/domains/ai/ai-portrait/types';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface StepGeneratingProps {
  styleId: ArtStyleId | null;
}

export default function StepGenerating({ styleId }: StepGeneratingProps) {
  const styleName = styleId
    ? (AI_ART_STYLES.find((s) => s.id === styleId)?.label ?? 'Art')
    : 'Art';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
        </motion.div>
        <h3 className="text-heading-3 mb-3">Creating Your {styleName} Portrait</h3>
        <p className="text-body text-muted-foreground mb-10 text-center max-w-md">
          Our AI is generating 6 unique variations. This usually takes 45-90 seconds.
        </p>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
