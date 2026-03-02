import { NextResponse } from 'next/server';

/**
 * Security.txt route handler
 *
 * Provides security contact information as per RFC 9116
 * Accessible at: /.well-known/security.txt
 *
 * @see https://www.rfc-editor.org/rfc/rfc9116.html
 */
export async function GET() {
  const contactEmail =
    process.env.NEXT_PUBLIC_SITE_EMAIL || 'hello@petportraitai.com';

  const securityTxt = [
    '# Security Policy',
    `Contact: mailto:${contactEmail}`,
    'Expires: 2027-12-31T23:59:59.000Z',
    'Preferred-Languages: en',
    'Canonical: https://www.rfc-editor.org/rfc/rfc9116.html',
    '',
    '# Security Disclosure Policy',
    'We appreciate responsible disclosure of security vulnerabilities.',
    'Please email security concerns to the contact address above.',
    '',
    '# Acknowledgments',
    'We thank security researchers who help keep our service safe.',
  ].join('\n');

  return new NextResponse(securityTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
