import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  headers() {
    const isProduction = process.env.NODE_ENV === 'production';

    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      ...(isProduction ? [] : ["'unsafe-eval'"]),
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://vercel.live',
      'https://*.sentry.io',
    ];

    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: [
          'camera=()',
          'microphone=()',
          'geolocation=()',
          'interest-cohort=()',
          'payment=()',
          'usb=()',
          'magnetometer=()',
          'gyroscope=()',
          'accelerometer=()',
          'ambient-light-sensor=()',
          'autoplay=()',
          'battery=()',
          'bluetooth=()',
          'document-domain=()',
          'encrypted-media=()',
          'execution-while-not-rendered=()',
          'execution-while-out-of-viewport=()',
          'fullscreen=(self)',
          'gamepad=()',
          'hid=()',
          'idle-detection=()',
          'local-fonts=()',
          'midi=()',
          'notifications=()',
          'picture-in-picture=()',
          'publickey-credentials-get=()',
          'screen-wake-lock=()',
          'serial=()',
          'speaker-selection=()',
          'storage-access=()',
          'sync-xhr=()',
          'unoptimized-images=()',
          'unsized-media=()',
          'vertical-scroll=()',
          'web-share=()',
          'xr-spatial-tracking=()',
        ].join(', '),
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          `script-src ${scriptSrc.join(' ')}`,
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https://cdn.shopify.com https://res.cloudinary.com https://utfs.io https://*.ufs.sh https://images.unsplash.com https://www.googletagmanager.com https://www.google-analytics.com",
          "font-src 'self' data: https://fonts.gstatic.com https://cdn.shopify.com",
          "connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.myshopify.com https://*.shopifycdn.com https://vercel.live https://uploadthing.com https://*.uploadthing.com https://*.sentry.io https://*.ingest.sentry.io",
          "frame-src 'self' https://www.googletagmanager.com https://vercel.live",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'self'",
          // Only upgrade insecure requests in production (where HTTPS is available)
          ...(isProduction ? ['upgrade-insecure-requests'] : []),
        ].join('; '),
      },
      {
        key: 'X-XSS-Protection',
        value: '0',
      },
    ];

    // Only add HSTS header in production (where HTTPS is available)
    if (isProduction) {
      securityHeaders.splice(2, 0, {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return Promise.resolve([
      {
        headers: securityHeaders,
        source: '/(.*)',
      },
    ]);
  },
  images: {
    remotePatterns: [
      {
        hostname: 'res.cloudinary.com',
        protocol: 'https',
      },
      {
        hostname: 'cdn.shopify.com',
        protocol: 'https',
      },
      {
        hostname: 'utfs.io', // UploadThing
        protocol: 'https',
      },
      {
        hostname: '**.utfs.io',
        protocol: 'https',
      },
      {
        hostname: 'ufs.sh',
        protocol: 'https',
      },
      {
        hostname: '**.ufs.sh',
        protocol: 'https',
      },
      {
        hostname: 'images.unsplash.com',
        protocol: 'https',
      },
    ],
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: !process.env.CI,
    })
  : nextConfig;
