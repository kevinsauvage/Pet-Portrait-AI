import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';

export default function AdminOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gelato POD Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          The Gelato Shopify app handles fulfillment automatically when orders contain the{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">gelato_print_url</code> line item
          attribute. View order status in the{' '}
          <a
            href="https://dashboard.gelato.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Gelato dashboard
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}
