import { isTrustedHttpsImageHost } from '@/core/utils/trusted-https-image-host';

export function isArtworkUrlHostnameAllowed(urlString: string): boolean {
  return isTrustedHttpsImageHost(urlString);
}
