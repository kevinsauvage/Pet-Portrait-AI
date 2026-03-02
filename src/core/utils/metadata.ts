import type { Metadata } from 'next';

import siteMetadata from '@/core/config/siteMetadata';

/**
 * Get base URL for the application
 * Server-side utility for metadata generation
 */
export function getBaseUrl(): string {
  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (envBaseUrl) {
    return envBaseUrl.replace(/\/$/, '');
  }

  if (siteMetadata.siteUrl) {
    return siteMetadata.siteUrl;
  }

  throw new Error(
    'NEXT_PUBLIC_BASE_URL is not set and siteMetadata.siteUrl is not configured. ' +
      'Please set NEXT_PUBLIC_BASE_URL environment variable.',
  );
}

type MetadataOptions = {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
};

/**
 * Generate Next.js metadata object
 * Server-side utility for SEO metadata
 */
export function generateMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  noindex = false,
}: MetadataOptions): Metadata {
  const siteUrl = getBaseUrl();
  const pageTitle = title;
  const imageUrl = image || siteMetadata.siteLogo;
  const pageUrl = url ? `${siteUrl}${url}` : siteUrl;

  const optimizedDescription =
    description.length > 160 ? `${description.substring(0, 157)}...` : description;

  return {
    title: pageTitle,
    description: optimizedDescription,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: optimizedDescription,
      url: pageUrl,
      siteName: siteMetadata.companyName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: optimizedDescription,
      images: [imageUrl],
      creator: siteMetadata.twitterHandle,
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
