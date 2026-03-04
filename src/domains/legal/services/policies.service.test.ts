import {
  getPrivacyPolicy,
  getRefundPolicy,
  getShippingPolicy,
  getSubscriptionPolicy,
  getTermsOfService,
} from './policies.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    getPrivacyPolicy: vi.fn().mockResolvedValue({ shop: { privacyPolicy: { title: 'Privacy' } } }),
    getRefundPolicy: vi.fn().mockResolvedValue({ shop: { refundPolicy: { title: 'Refund' } } }),
    getShippingPolicy: vi.fn().mockResolvedValue({ shop: { shippingPolicy: { title: 'Shipping' } } }),
    getSubscriptionPolicy: vi.fn().mockResolvedValue({ shop: { subscriptionPolicy: { title: 'Subscription' } } }),
    getTermsOfService: vi.fn().mockResolvedValue({ shop: { termsOfService: { title: 'Terms' } } }),
  })),
}));

describe('policies.service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getPrivacyPolicy returns policy from storefront', async () => {
    const result = await getPrivacyPolicy();
    expect(result).toEqual({ title: 'Privacy' });
  });

  it('getRefundPolicy returns policy from storefront', async () => {
    const result = await getRefundPolicy();
    expect(result).toEqual({ title: 'Refund' });
  });

  it('getShippingPolicy returns policy from storefront', async () => {
    const result = await getShippingPolicy();
    expect(result).toEqual({ title: 'Shipping' });
  });

  it('getTermsOfService returns policy from storefront', async () => {
    const result = await getTermsOfService();
    expect(result).toEqual({ title: 'Terms' });
  });

  it('getSubscriptionPolicy returns policy from storefront', async () => {
    const result = await getSubscriptionPolicy();
    expect(result).toEqual({ title: 'Subscription' });
  });
});
