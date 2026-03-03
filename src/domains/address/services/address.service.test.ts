import { AddressService } from './address.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/server', () => ({
  getShopifyToken: vi.fn(),
}));

vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    getCustomerAddresses: vi.fn().mockResolvedValue({ customer: { addresses: { edges: [] } } }),
    customerAddressCreate: vi.fn().mockResolvedValue({
      customerAddressCreate: { customerAddress: { id: 'addr-1' }, customerUserErrors: [] },
    }),
    customerAddressUpdate: vi.fn().mockResolvedValue({
      customerAddressUpdate: { customerAddress: { id: 'addr-1' }, customerUserErrors: [] },
    }),
    customerAddressDelete: vi.fn().mockResolvedValue({
      customerAddressDelete: { deletedCustomerAddressId: 'addr-1', customerUserErrors: [] },
    }),
    customerDefaultAddressUpdate: vi.fn().mockResolvedValue({
      customerDefaultAddressUpdate: { customer: {}, customerUserErrors: [] },
    }),
  })),
}));

const { getShopifyToken } = await import('@/infra/shopify/server');

describe('AddressService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const baseAddress = {
    address1: '123 Main St',
    city: 'NY',
    country: 'US',
    firstName: 'Jane',
    lastName: 'Doe',
    zip: '10001',
  };

  describe('getCustomerAddresses', () => {
    it('returns null when no token', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue(undefined);
      const result = await AddressService.getCustomerAddresses();
      expect(result).toBeNull();
    });

    it('returns addresses when token present', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue('token' as never);
      const result = await AddressService.getCustomerAddresses();
      expect(result).not.toBeNull();
    });
  });

  describe('createAddress', () => {
    it('returns error when not authenticated', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue(undefined);
      const result = await AddressService.createAddress(baseAddress);
      expect(result).toEqual({ error: 'User not authenticated' });
    });

    it('returns success when address created', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue('token' as never);
      const result = await AddressService.createAddress(baseAddress);
      expect(result).toEqual({ success: true, customerAddress: { id: 'addr-1' } });
    });
  });

  describe('updateAddress', () => {
    it('returns error when id is missing', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue('token' as never);
      const result = await AddressService.updateAddress(baseAddress);
      expect(result).toEqual({ error: 'Address ID is required for update' });
    });

    it('returns error when not authenticated', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue(undefined);
      const result = await AddressService.updateAddress({ ...baseAddress, id: 'addr-1' });
      expect(result).toEqual({ error: 'User not authenticated' });
    });

    it('returns success when address updated', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue('token' as never);
      const result = await AddressService.updateAddress({ ...baseAddress, id: 'addr-1' });
      expect(result).toEqual({ success: true, customerAddress: { id: 'addr-1' } });
    });
  });

  describe('deleteAddress', () => {
    it('returns error when not authenticated', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue(undefined);
      const result = await AddressService.deleteAddress('addr-1');
      expect(result).toEqual({ error: 'User not authenticated' });
    });

    it('returns success when address deleted', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue('token' as never);
      const result = await AddressService.deleteAddress('addr-1');
      expect(result).toEqual({ success: true, deletedCustomerAddressId: 'addr-1' });
    });
  });

  describe('setDefaultAddress', () => {
    it('returns error when not authenticated', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue(undefined);
      const result = await AddressService.setDefaultAddress('addr-1');
      expect(result).toEqual({ error: 'User not authenticated' });
    });

    it('returns success when default address set', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue('token' as never);
      const result = await AddressService.setDefaultAddress('addr-1');
      expect(result).toEqual({ success: true, customer: {} });
    });
  });

  describe('createAddress (error handling)', () => {
    it('returns default error when no customerAddress and no userErrors', async () => {
      vi.mocked(getShopifyToken).mockResolvedValue('token' as never);
      const { storefrontSdk } = await import('@/infra/shopify/client');
      (storefrontSdk as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        customerAddressCreate: vi.fn().mockResolvedValue({
          customerAddressCreate: { customerAddress: null, customerUserErrors: [] },
        }),
      });
      const result = await AddressService.createAddress(baseAddress);
      expect(result).toEqual({ error: 'Something went wrong' });
    });
  });
});
