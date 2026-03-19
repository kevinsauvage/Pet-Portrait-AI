import { getShopConfig } from '@/domains/shop/get-shop-config.service';
import CreateProgressBar from '@/ui/components/create/CreateProgressBar';

import { Sparkles } from 'lucide-react';

export default async function GeneratingLoading() {
  const shopConfig = await getShopConfig();
  const { variationsCount } = shopConfig.ai;
  const { minSeconds, maxSeconds } = shopConfig.ai.timeEstimate;

  return (
    <>
      <CreateProgressBar currentStep="generating" />
      <div className="flex flex-col items-center justify-center py-16 md:py-24">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border-2 border-primary/20">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" strokeWidth={1.5} />
          </div>
        </div>
        <div className="space-y-4 text-center max-w-lg">
          <h2 className="text-heading-3 font-semibold">Creating Your Portrait</h2>
          <p className="text-body-lg text-muted-foreground leading-relaxed">
            Our AI is generating {variationsCount} unique variation{variationsCount > 1 ? 's' : ''}{' '}
            of your pet portrait. This usually takes {minSeconds}–{maxSeconds} seconds.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-10">
          {Array.from({ length: variationsCount }, (_, i) => ({ id: `bounce-dot-${i}`, delay: i * 0.15 })).map(({ id, delay }) => (
            <div
              key={id}
              className="h-3 w-3 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
