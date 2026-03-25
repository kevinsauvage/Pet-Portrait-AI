import Link from 'next/link';

import config from '@/core/config';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import { getStyleLabel } from '@/domains/ai/ai-portrait/utils/style-utils';
import type { UserCreation } from '@/domains/creations/types';
import ProtectedImage from '@/ui/components/media/ProtectedImage';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardFooter } from '@/ui/primitives/card';

import { ShoppingBag, Wand2 } from 'lucide-react';

type Props = {
  creation: UserCreation;
};

const CreationCard = ({ creation }: Props) => {
  const { generatedUrls, styleId, generationId, createdAt } = creation;
  const styleLabel = getStyleLabel(styleId) ?? styleId;
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const firstGenerated = generatedUrls[0];

  const orderHref = firstGenerated
    ? `${config.routes.createCollections}${buildCreateFlowQueryString({
        artwork: firstGenerated,
        styleId,
        generationId,
        urls: generatedUrls.join('|'),
      })}`
    : null;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="grid grid-cols-2 gap-1 p-3">
        {generatedUrls.slice(0, 4).map((url, i) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden">
            <ProtectedImage
              src={url}
              alt={`Portrait variation ${i + 1}`}
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </div>
        ))}

        {generatedUrls.length === 0 && (
          <div className="aspect-square rounded-lg bg-muted flex items-center justify-center col-span-2">
            <Wand2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardContent className="px-3 pb-2 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-caption-sm">
            {styleLabel}
          </Badge>
          <span className="text-caption-sm text-muted-foreground">{date}</span>
        </div>
        <p className="text-caption-sm text-muted-foreground mt-1.5">
          {generatedUrls.length} variation{generatedUrls.length !== 1 ? 's' : ''} generated
        </p>
      </CardContent>

      <CardFooter className="px-3 pb-3 gap-2 flex-col">
        {orderHref && (
          <Button asChild size="sm" className="w-full gap-2">
            <Link href={orderHref}>
              <ShoppingBag className="h-3.5 w-3.5" />
              Order this portrait
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" size="sm" className="w-full gap-2">
          <Link href={config.routes.create}>
            <Wand2 className="h-3.5 w-3.5" />
            Create a new portrait
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreationCard;
