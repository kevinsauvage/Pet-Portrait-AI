import { OrderTrackingService } from './order-tracking.service';

import { describe, expect, it } from 'vitest';

describe('OrderTrackingService', () => {
  describe('getOrderStatus', () => {
    it('returns null for any order id', async () => {
      const result = await OrderTrackingService.getOrderStatus('order-123');
      expect(result).toBeNull();
    });
  });
});
