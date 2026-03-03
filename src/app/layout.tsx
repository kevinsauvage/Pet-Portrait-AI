import type { Metadata } from 'next';
import type { NextWebVitalsMetric } from 'next/app';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';

import { CartProvider } from '@/contexts/CartContext/CartContext';
import { UserProvider } from '@/contexts/UserContext/UserContext';
import seo from '@/core/config/seo';
import siteMetadata from '@/core/config/siteMetadata';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/core/utils/structured-data';
import { CartService } from '@/domains/cart/services/cart.service';
import { getSiteMenus } from '@/domains/navigation/services/menu.service';
import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';
import CookieBannerWrapper from '@/ui/components/consent/CookieBannerWrapper';
import GtmScript from '@/ui/components/consent/GtmScript';
import Footer from '@/ui/components/navigation/Footer';
import Header from '@/ui/components/navigation/Header';
import { Toaster } from '@/ui/primitives/sonner';
import { ThemeProvider } from '@/ui/providers/theme-provider';

import '../globals.css';

import * as Sentry from '@sentry/nextjs';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
});

const baseMetadata: Metadata = {
  title: {
    default: seo.home.title,
    template: `%s | ${siteMetadata.companyName}`,
  },
  description: seo.home.description,
  metadataBase: new URL(siteMetadata.siteUrl),
  openGraph: {
    type: 'website',
    siteName: siteMetadata.companyName,
    title: seo.home.title,
    description: seo.home.description,
  },
  twitter: {
    card: 'summary_large_image',
    site: siteMetadata.twitterHandle,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const trace = Sentry.getTraceData();

  return {
    ...baseMetadata,
    other: (trace as Metadata['other']) ?? baseMetadata.other,
  };
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const [menus, initialCart, user, userWishlist] = await Promise.all([
    getSiteMenus(),
    CartService.getExistingCart(),
    getUser(),
    WishlistService.getWishlist(),
  ]);

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} font-sans scroll-smooth antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
      </head>
      <body className="relative bg-background min-h-screen">
        {/* Structured Data - Organization & Website */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebSiteSchema()),
          }}
        />

        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_top,rgba(194,65,12,0.08)_0%,transparent_70%)] blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/10 to-transparent" />
        </div>
        <GtmScript />
        <CookieBannerWrapper />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider initialCart={initialCart}>
            <UserProvider user={user} userWishlist={userWishlist}>
              <div className="relative z-10 flex min-h-screen flex-col">
                <Header headerMenu={menus.headerMenu} />
                <main className="flex-1">{children}</main>
                <Toaster richColors />
                <Footer menuItems={menus.footerMenu?.items} />
              </div>
            </UserProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

const WEB_VITAL_BUDGETS: Partial<Record<NextWebVitalsMetric['name'], number>> = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
};

export function reportWebVitals(metric: NextWebVitalsMetric) {
  const budget = WEB_VITAL_BUDGETS[metric.name];
  const isOverBudget = typeof budget === 'number' && metric.value > budget;

  if (!isOverBudget) return;

  Sentry.captureMessage(`Web Vital ${metric.name} over budget`, {
    level: 'warning',
    extra: {
      name: metric.name,
      value: metric.value,
      budget,
      id: metric.id,
    },
  });
}

export default RootLayout;
