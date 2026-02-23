import { storefrontSdk } from '@/infra/shopify/client';
import type {
  GetPrivacyPolicyQuery,
  GetRefundPolicyQuery,
  GetShippingPolicyQuery,
  GetTermsOfServiceQuery,
} from '@/infra/shopify/storefront';

type Policy =
  | GetPrivacyPolicyQuery['shop']['privacyPolicy']
  | GetRefundPolicyQuery['shop']['refundPolicy']
  | GetShippingPolicyQuery['shop']['shippingPolicy']
  | GetTermsOfServiceQuery['shop']['termsOfService'];

export async function getPrivacyPolicy(): Promise<Policy | null | undefined> {
  const response = await storefrontSdk().getPrivacyPolicy({});
  return response?.shop?.privacyPolicy;
}

export async function getRefundPolicy(): Promise<Policy | null | undefined> {
  const response = await storefrontSdk().getRefundPolicy({});
  return response?.shop?.refundPolicy;
}

export async function getShippingPolicy(): Promise<Policy | null | undefined> {
  const response = await storefrontSdk().getShippingPolicy({});
  return response?.shop?.shippingPolicy;
}

export async function getTermsOfService(): Promise<Policy | null | undefined> {
  const response = await storefrontSdk().getTermsOfService({});
  return response?.shop?.termsOfService;
}
