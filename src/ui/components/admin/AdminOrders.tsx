import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';

export default function AdminOrders() {
  return (
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
  );
}
