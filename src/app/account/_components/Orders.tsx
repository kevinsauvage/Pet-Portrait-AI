import type { GetCustomerOrdersQuery } from '@/modules/shopify/storefront';

import OrderCard from './OrderCard';

const Orders = ({ orders }: { orders: GetCustomerOrdersQuery['customer'] | null | undefined }) => {
  const orderEdges = orders?.orders?.edges;

  if (Array.isArray(orderEdges) && orderEdges.length > 0) {
    return (
      <ul className="grid grid-cols-1 gap-4 mb-4">
        {orderEdges.map((order) => (
          <OrderCard key={order.node.id} order={order.node} />
        ))}
      </ul>
    );
  }

  return null;
};

export default Orders;
