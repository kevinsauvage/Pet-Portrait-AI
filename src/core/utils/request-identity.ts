type ClientContext = {
  ip: string;
  ua: string;
  identifier: string;
};

function getForwardedIp(headers: Headers): string | undefined {
  const forwarded = headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim();
}

export function getClientContext(
  headers: Headers,
  fallbackIp = 'anonymous',
): ClientContext {
  const ip = getForwardedIp(headers) ?? headers.get('x-real-ip') ?? fallbackIp;
  const ua = headers.get('user-agent') ?? 'unknown';
  return { ip, ua, identifier: `${ip}:${ua}` };
}
