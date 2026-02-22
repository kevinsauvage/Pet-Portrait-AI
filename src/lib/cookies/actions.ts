'use server';

import { cookies } from 'next/headers';

import { safeLogError } from '@/core/utils/api-responses';

export const delCookieAction = async (name: string) => {
  const cookieStore = await cookies();
  return cookieStore.delete(name);
};

export const getCookieAction = async (name: string) => {
  if (!name) {
    safeLogError('getCookieAction', new Error('Cookie name is required'));
    return;
  }
  const cookieStore = await cookies();
  return cookieStore.get(name);
};

export const setCookieAction = async (name: string, value: string, options = {}) => {
  if (!name || !value) {
    safeLogError('setCookieAction', new Error('Cookie name and value are required'));
    return;
  }

  const cookieStore = await cookies();
  return cookieStore.set(name, value, options);
};
