import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-body-sm font-medium text-muted-foreground">
              Pending Gelato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-heading-2 font-bold">—</p>
            <p className="text-caption-sm text-muted-foreground mt-1">View in Gelato dashboard</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
