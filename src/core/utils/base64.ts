export function base64Encode(value: string): string {
  if (typeof btoa === 'function') {
    return btoa(value);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value).toString('base64');
  }
  throw new Error('Base64 encoding is not supported in this runtime.');
}

export function base64Decode(value: string): string {
  if (typeof atob === 'function') {
    return atob(value);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'base64').toString('utf8');
  }
  throw new Error('Base64 decoding is not supported in this runtime.');
}

export function base64UrlEncode(value: string): string {
  return base64Encode(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const withPadding = `${padded}${'='.repeat(padLength)}`;
  return base64Decode(withPadding);
}
