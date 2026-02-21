import { safeLogError } from '@/utils/api-responses';

export const OrderTrackingService = {
  async getOrderStatus(orderId: string): Promise<string | null> {
    try {
      void orderId;
      return null;
    } catch (error) {
      safeLogError('OrderTrackingService.getOrderStatus', error);
      return null;
    }
  },
};
