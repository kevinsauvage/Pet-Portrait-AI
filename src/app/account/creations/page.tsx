import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { CreationsService } from '@/domains/creations/creations.service';
import { noFavoriteIllustration } from '@/lib/illustrations';
import CreationCard from '@/ui/components/account/CreationCard';
import BackButton from '@/ui/components/shared/BackButton';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import EmptyState from '@/ui/components/shared/EmptyState';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent } from '@/ui/primitives/card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: seo.account.creations.title,
  description: seo.account.creations.description,
};

const CreationsPage = async () => {
  const creations = await CreationsService.getCreations();

  if (!creations.length) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            variant="default"
            image={noFavoriteIllustration}
            title="No creations yet"
            subtitle="Upload a pet photo and choose an art style to generate your first AI portrait. Your creations will appear here."
            altText="No creations yet"
            primaryAction={
              <Button variant="default" asChild>
                <Link href={config.routes.create}>Create your first portrait</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeaderPattern
        title={`My Creations (${creations.length})`}
        size={3}
        actions={<BackButton />}
        description="All the AI portraits you've generated. Open a creation to order products or start a new portrait from the home flow."
      />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {creations.map((creation) => (
            <CreationCard key={creation.id} creation={creation} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreationsPage;
