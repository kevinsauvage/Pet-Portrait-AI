'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import config from '@/core/config';
import { type ArtStyleId } from '@/domains/ai/ai-portrait/types';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { getStyleLabel } from '@/domains/ai/ai-portrait/utils/style-utils';
import { api } from '@/infra/http/api-client';

import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratingIslandProps {
  photo: string;
  styleId: ArtStyleId;
}

export default function GeneratingIsland({ photo, styleId }: GeneratingIslandProps) {
  const router = useRouter();
  const generationRef = useRef<string | null>(null);

  useEffect(() => {
    const token = crypto.randomUUID();
    generationRef.current = token;

    api
      .post<{ data: { urls: string[]; generationId: string; styleId: ArtStyleId } }>(
        '/api/ai/generate',
        { originalPhotoUrl: photo, styleId },
      )
      .then((res) => {
        if (generationRef.current !== token) return;
        const { data } = res;
        if (!data?.urls?.length) throw new Error('Invalid response from generation API');

        const encodedUrls = encodeURIComponent(data.urls.join('|'));
        const queryString = buildCreateFlowQueryString({
          photo,
          styleId: data.styleId,
          generationId: data.generationId,
        });
        const urlsParam = encodedUrls ? `&urls=${encodedUrls}` : '';

        router.push(`${config.routes.createSelect}${queryString}${urlsParam}`);
      })
      .catch((err) => {
        if (generationRef.current !== token) return;
        toast.error(err?.message ?? 'Generation failed. Please try again.');
        router.push(`${config.routes.createStyle}${buildCreateFlowQueryString({ photo })}`);
      });

    return () => {
      generationRef.current = null;
    };
  }, [router, photo, styleId]);

  const styleName = getStyleLabel(styleId) ?? 'Art';

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <Sparkles className="h-10 w-10 animate-pulse text-primary" />
      </div>
      <h3 className="mb-3 text-heading-3">Creating Your {styleName} Portrait</h3>
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
  );
}
