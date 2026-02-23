import type { GenerationLogEntry } from '@/domains/ai/models';
import AdminRefreshButton from '@/ui/components/admin/AdminRefreshButton';
import AdminRegenerateForm from '@/ui/components/admin/AdminRegenerateForm';
import { Badge } from '@/ui/primitives/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';

interface AdminGenerationsProps {
  generations: GenerationLogEntry[];
  failedCount: number;
  totalCount: number;
}

export default function AdminGenerations({
  generations,
  failedCount,
  totalCount,
}: AdminGenerationsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle>Generation Logs</CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{totalCount} total</span>
            <Badge variant={failedCount > 0 ? 'destructive' : 'secondary'}>
              {failedCount} failed
            </Badge>
          </div>
        </div>
        <AdminRefreshButton />
      </CardHeader>
      <CardContent>
        {generations.length === 0 ? (
          <p className="text-muted-foreground">
            No generation logs yet. Logs are stored in-memory. Use Sentry or a database for
            production persistence.
          </p>
        ) : (
          <ul className="space-y-3">
            {generations.map((generation) => (
              <li
                key={generation.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-0"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{generation.styleId}</span>
                    <Badge
                      variant={generation.status === 'failed' ? 'destructive' : 'secondary'}
                    >
                      {generation.status}
                    </Badge>
                  </div>
                  {generation.error && (
                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {generation.error}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(generation.timestamp).toLocaleString()}
                  </p>
                </div>
                {generation.status === 'failed' && generation.originalPhotoUrl && (
                  <AdminRegenerateForm
                    styleId={generation.styleId}
                    originalPhotoUrl={generation.originalPhotoUrl}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
