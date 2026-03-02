import { Skeleton } from '@/ui/primitives/skeleton';

import { Sparkles } from 'lucide-react';

export default function GeneratingLoading() {
  return (
    <div className="space-y-10">
      <div className="flex justify-center gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-7 rounded-full" />
        ))}
      </div>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-10 w-10 animate-pulse text-primary" />
        </div>
        <h3 className="mb-3 text-heading-3">Creating Your Portrait</h3>
        <p className="mb-10 max-w-md text-center text-body text-muted-foreground">
          Our AI is generating 6 unique variations. This usually takes 45–90 seconds.
        </p>
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
