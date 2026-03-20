const UPLOADTHING_EXACT_HOSTS = new Set(['utfs.io', 'ufs.sh']);

const UPLOADTHING_HOST_SUFFIXES = ['.utfs.io', '.ufs.sh'] as const;

function parseExtraAllowedHosts(): Set<string> {
  const raw = process.env.ALLOWED_IMAGE_URL_HOSTS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isTrustedHttpsImageHost(urlString: string): boolean {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') return false;
  if (url.username !== '' || url.password !== '') return false;

  const host = url.hostname.toLowerCase();
  if (UPLOADTHING_EXACT_HOSTS.has(host)) return true;
  if (UPLOADTHING_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;

  return parseExtraAllowedHosts().has(host);
}

const MAX_IMAGE_FETCH_REDIRECTS = 5;

export async function fetchTrustedHttpsImage(
  initialUrl: string,
  init?: RequestInit,
): Promise<Response> {
  if (!isTrustedHttpsImageHost(initialUrl)) {
    throw new Error('Image URL host is not allowed');
  }

  let url = initialUrl;
  for (let redirect = 0; redirect <= MAX_IMAGE_FETCH_REDIRECTS; redirect += 1) {
    // eslint-disable-next-line no-await-in-loop -- sequential redirect resolution
    const response = await fetch(url, {
      ...init,
      redirect: 'manual',
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error('Image fetch redirect missing Location header');
      }
      const nextUrl = new URL(location, url).href;
      if (!isTrustedHttpsImageHost(nextUrl)) {
        throw new Error('Image fetch redirect to disallowed host');
      }
      url = nextUrl;
      continue;
    }

    return response;
  }

  throw new Error(`Image fetch exceeded ${MAX_IMAGE_FETCH_REDIRECTS} redirects`);
}
