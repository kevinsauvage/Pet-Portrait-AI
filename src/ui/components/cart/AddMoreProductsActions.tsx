'use client';

import Link from 'next/link';

import config from '@/core/config';
import { buildCreateFlowQueryString } from '@/domains/ai/ai-portrait/utils/create-flow-params';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent } from '@/ui/primitives/card';

import { Plus, Upload } from 'lucide-react';

interface AddMoreProductsActionsProps {
  photo?: string;
  styleId?: string;
  generationId?: string;
  urls?: string;
  artwork?: string;
}

export default function AddMoreProductsActions({
  photo,
  styleId,
  generationId,
  urls,
  artwork,
}: AddMoreProductsActionsProps) {
  // Only show if we have the necessary params to go back to collections
  const hasCreateFlowParams = Boolean(artwork && styleId && generationId);

  if (!hasCreateFlowParams) {
    return null;
  }

  const collectionsHref = `${config.routes.createCollections}${buildCreateFlowQueryString({
    artwork,
    photo: photo ?? undefined,
    styleId,
    generationId,
    urls,
  })}`;

  // For upload, optionally keep styleId if available
  const uploadHref = styleId
    ? `${config.routes.create}${buildCreateFlowQueryString({ styleId })}`
    : config.routes.create;

  return (
    <Card>
      <CardHeaderPattern
        className="pb-4"
        size={4}
        title="Add More Products"
        description="Continue shopping with the same image or upload a new one."
      />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="w-full gap-2" asChild>
            <Link href={collectionsHref}>
              <Plus className="h-4 w-4" />
              Add More Products
            </Link>
          </Button>
          <Button variant="outline" className="w-full gap-2" asChild>
            <Link href={uploadHref}>
              <Upload className="h-4 w-4" />
              Upload New Image
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
