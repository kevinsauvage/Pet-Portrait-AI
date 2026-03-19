import type { AddressFormData, AddressNode } from './types';

export type { AddressFormData, AddressNode } from './types';

export const mapAddressEdgesToList = <T,>(
  addresses:
    | {
        edges?: Array<{
          node: T;
        }>;
      }
    | null
    | undefined,
): T[] => {
  return addresses?.edges?.map((edge) => edge.node) ?? [];
};

export const normalizeAddressId = (id: string | null | undefined): string => {
  return id?.split('?')[0] || '';
};

export const mapAddressNodeToFormData = (addressNode: AddressNode): AddressFormData => ({
  address1: addressNode.address1 ?? '',
  address2: addressNode.address2 ?? undefined,
  city: addressNode.city ?? '',
  company: addressNode.company ?? undefined,
  country: addressNode.country ?? '',
  firstName: addressNode.firstName ?? '',
  id: addressNode.id ?? '',
  lastName: addressNode.lastName ?? '',
  phone: addressNode.phone ?? undefined,
  province: addressNode.province ?? undefined,
  zip: addressNode.zip ?? '',
});

export const isSameAddressId = (
  left: string | null | undefined,
  right: string | null | undefined,
): boolean => {
  return normalizeAddressId(left) === normalizeAddressId(right);
};

export const findAddressById = (
  addresses:
    | {
        edges?: Array<{
          node: AddressNode;
        }>;
      }
    | null
    | undefined,
  id: string,
): AddressNode | null => {
  if (!addresses?.edges || addresses.edges.length === 0) {
    return null;
  }

  const normalizedId = normalizeAddressId(id);
  const node = addresses.edges
    .map((item) => item.node)
    .find((n) => normalizeAddressId(n.id) === normalizedId);

  return node || null;
};

export const isDefaultAddress = (
  address: { id?: string | null },
  defaultAddressId: string | null | undefined,
): boolean => {
  return isSameAddressId(address.id, defaultAddressId);
};
