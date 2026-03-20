/**
 * Printful preview fetches artworkUrl server-side; restrict hosts to our upload/CDN origins.
 * @see next.config.ts remotePatterns (utfs.io, ufs.sh)
 */

const ALLOWED_EXACT_HOSTS = new Set(['utfs.io', 'ufs.sh']);

const ALLOWED_HOST_SUFFIXES = ['.utfs.io', '.ufs.sh'] as const;

export function isArtworkUrlHostnameAllowed(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    if (ALLOWED_EXACT_HOSTS.has(host)) return true;
    return ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}
