'use client';

import { logger } from '@/core/utils/logger';

import Cookies from 'js-cookie';

/**
 * Client-side cookie utilities (browser).
 * Uses js-cookie for encoding/decoding edge cases vs manual `document.cookie` parsing.
 */

export const getCookieFront = (name: string): string => {
  if (typeof document === 'undefined') return '';
  return Cookies.get(name) ?? '';
};

export const setCookieFront = (
  cName: string,
  cValue: string,
  expDays: number = 1,
  sameSite: 'Lax' | 'Strict' | 'None' | undefined = 'Lax',
) => {
  if (typeof cName !== 'string' || typeof expDays !== 'number') {
    throw new TypeError('Invalid input parameters');
  }

  const isProduction = process.env.NODE_ENV === 'production';

  try {
    if (typeof document !== 'undefined') {
      Cookies.set(cName, cValue, {
        expires: expDays,
        path: '/',
        secure: isProduction,
        ...(sameSite ? { sameSite } : {}),
      });
    }
  } catch (error) {
    logger.error('Failed to set cookie', { context: 'cookies.set', error });
  }
};
