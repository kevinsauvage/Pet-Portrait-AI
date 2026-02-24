'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { logger } from '@/core/utils/logger';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const AdminError = ({ error, reset }: AdminErrorProps) => {
  useEffect(() => {
    logger.error('admin', error);
  }, [error]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          We could not load this admin view. Try again, or go back to the overview.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/admin/overview">Back to overview</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminError;
