import { getShopConfig } from '@/domains/shop/services';
import { Skeleton } from '@/ui/primitives/skeleton';

import { Sparkles } from 'lucide-react';

export default async function GeneratingLoading() {
  const shopConfig = await getShopConfig();
  const { variationsCount } = shopConfig.ai;
  const { minSeconds, maxSeconds } = shopConfig.ai.timeEstimate;

  return (
    <div className="space-y-10">
      <div className="flex justify-center gap-4">
        {Array.from({ length: variationsCount }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-7 rounded-full" />
        ))}
      </div>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-10 w-10 animate-pulse text-primary" />
        </div>
        <h3 className="mb-3 text-heading-3">Creating Your Portrait</h3>
        <p className="mb-10 max-w-md text-center text-body text-muted-foreground">
          Our AI is generating {variationsCount} unique variation{variationsCount > 1 ? 's' : ''}.
          This usually takes {minSeconds}–{maxSeconds} seconds.
        </p>
        <div className="flex gap-2">
          {Array.from({ length: variationsCount }).map((_, i) => (
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
