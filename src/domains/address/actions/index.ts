'use server';

import { redirect } from 'next/navigation';

import config from '@/core/config';
import { zodErrorsToFormActionResult } from '@/core/utils/form-actions';

import { AddressService } from '../services/address.service';
import { type AddressInput, addressSchema } from '../validation';

export async function createAddressAction(input: AddressInput) {
  const result = addressSchema.safeParse(input);
  if (!result?.success) {
    return zodErrorsToFormActionResult(result.error);
  }

  const serviceResult = await AddressService.createAddress(result.data);

  if ('error' in serviceResult) {
    return serviceResult;
  }

  return redirect(config.routes.addresses);
}

export async function deleteAddressAction(addressId: string) {
  const serviceResult = await AddressService.deleteAddress(addressId);

  if ('error' in serviceResult) {
    return serviceResult;
  }

  return redirect(config.routes.addresses);
}

export async function setDefaultAddressAction(addressId: string) {
  const serviceResult = await AddressService.setDefaultAddress(addressId);

  if ('error' in serviceResult) {
    return serviceResult;
  }

  return redirect(config.routes.addresses);
}

export async function updateAddressAction(input: AddressInput) {
  const result = addressSchema.safeParse(input);
  if (!result?.success) {
    return zodErrorsToFormActionResult(result.error);
  }

  const serviceResult = await AddressService.updateAddress(result.data);

  if ('error' in serviceResult) {
    return serviceResult;
  }

  return redirect(config.routes.addresses);
}
