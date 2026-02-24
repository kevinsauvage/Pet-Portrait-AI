import { logger } from '@/core/utils/logger';

export const OrderTrackingService = {
  async getOrderStatus(orderId: string): Promise<string | null> {
    try {
      void orderId;
      return null;
    } catch (error) {
      logger.error('OrderTrackingService.getOrderStatus', error);
      return null;
    }
  },
};
