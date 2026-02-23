import type { GenerationLogEntry } from '@/domains/ai/models';
import { Badge } from '@/ui/primitives/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Separator } from '@/ui/primitives/separator';

interface AdminOverviewProps {
  totalCount: number;
  failedCount: number;
  latestGenerations: GenerationLogEntry[];
}

export default function AdminOverview({
  totalCount,
  failedCount,
  latestGenerations,
}: AdminOverviewProps) {
  const successCount = Math.max(totalCount - failedCount, 0);
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{successRate}%</p>
              <Badge variant={failedCount > 0 ? 'destructive' : 'secondary'}>
                {failedCount} failed
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Gelato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground mt-1">View in Gelato dashboard</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Generations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {latestGenerations.length === 0 ? (
            <p className="text-muted-foreground">
              No generation logs yet. Logs are stored in-memory. Use Sentry or a database for
              production persistence.
            </p>
          ) : (
            <ul className="space-y-3">
              {latestGenerations.map((generation, index) => (
                <li key={generation.id} className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{generation.styleId}</span>
                    <Badge
                      variant={generation.status === 'failed' ? 'destructive' : 'secondary'}
                    >
                      {generation.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(generation.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {generation.error && (
                    <p className="text-xs text-muted-foreground truncate max-w-xl">
                      {generation.error}
                    </p>
                  )}
                  {index < latestGenerations.length - 1 && <Separator />}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
