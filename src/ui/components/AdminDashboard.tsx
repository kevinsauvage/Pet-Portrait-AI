'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs';

import { RefreshCw, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface GenerationLog {
  id: string;
  generationId: string;
  styleId: string;
  timestamp: string;
  status: 'success' | 'failed';
  error?: string;
  originalPhotoUrl?: string;
}

interface GenerationsResponse {
  data: GenerationLog[];
  failedCount: number;
  totalCount: number;
}

export default function AdminDashboard() {
  const [generations, setGenerations] = useState<GenerationLog[]>([]);
  const [failedCount, setFailedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const fetchGenerations = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/generations')
      .then((res) => (res.ok ? res.json() : { data: [], failedCount: 0 }))
      .then((json: GenerationsResponse) => {
        setGenerations(json.data ?? []);
        setFailedCount(json.failedCount ?? 0);
      })
      .catch(() => {
        setGenerations([]);
        setFailedCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  const handleRegenerate = (entry: GenerationLog) => {
    if (!entry.originalPhotoUrl || entry.status !== 'failed') return;
    setRegenerating(entry.id);
    fetch('/api/admin/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalPhotoUrl: entry.originalPhotoUrl,
        styleId: entry.styleId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.message ?? data.error);
        toast.success('Regeneration started');
        fetchGenerations();
      })
      .catch((err) => {
        toast.error(err?.message ?? 'Regeneration failed');
      })
      .finally(() => setRegenerating(null));
  };

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="generations">Generations</TabsTrigger>
        <TabsTrigger value="orders">POD Orders</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Generations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{loading ? '—' : generations.length}</p>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{loading ? '—' : failedCount}</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="generations" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generation Logs</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchGenerations} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : generations.length === 0 ? (
              <p className="text-muted-foreground">
                No generation logs yet. Logs are stored in-memory. Use Sentry or a database for
                production persistence.
              </p>
            ) : (
              <ul className="space-y-3">
                {generations.map((g) => (
                  <li
                    key={g.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{g.styleId}</span>
                      <span
                        className={`ml-2 text-sm ${
                          g.status === 'failed'
                            ? 'text-destructive'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {g.status}
                      </span>
                      {g.error && (
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                          {g.error}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(g.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {g.status === 'failed' && g.originalPhotoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerate(g)}
                        disabled={regenerating === g.id}
                      >
                        <RotateCcw
                          className={`mr-1 h-3 w-3 ${regenerating === g.id ? 'animate-spin' : ''}`}
                        />
                        Retry
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="orders" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Gelato POD Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configure the Shopify orders/create webhook to trigger Gelato fulfillment. View order
              status in the{' '}
              <a
                href="https://dashboard.gelato.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Gelato dashboard
              </a>
              . Gelato manages Shopify tracking sync automatically.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
