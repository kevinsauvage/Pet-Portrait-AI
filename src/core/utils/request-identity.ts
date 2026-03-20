type ClientContext = {
  ip: string;
  ua: string;
  identifier: string;
};

function getClientIpFromProxyHeaders(
  headers: Headers,
  options: { allowCfConnectingIp: boolean },
): string | undefined {
  if (options.allowCfConnectingIp) {
    const cf = headers.get('cf-connecting-ip')?.trim();
    if (cf) return cf;
  }

  const forwarded = headers.get('x-forwarded-for');
  const firstForwarded = forwarded?.split(',')[0]?.trim();
  if (firstForwarded) return firstForwarded;

  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return undefined;
}

function shouldUseProxyHeadersForIp(): boolean {
  return (
    process.env.TRUST_FORWARDED_IP_HEADERS === 'true' || process.env.VERCEL === '1'
  );
}

export function getClientContext(
  headers: Headers,
  fallbackIp = 'anonymous',
): ClientContext {
  const trustExplicit = process.env.TRUST_FORWARDED_IP_HEADERS === 'true';
  const ip = shouldUseProxyHeadersForIp()
    ? (getClientIpFromProxyHeaders(headers, { allowCfConnectingIp: trustExplicit }) ?? fallbackIp)
    : fallbackIp;
  const ua = headers.get('user-agent') ?? 'unknown';
  return { ip, ua, identifier: `${ip}:${ua}` };
}
