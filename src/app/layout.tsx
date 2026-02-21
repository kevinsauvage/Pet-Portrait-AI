import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { CartProvider } from '@/contexts/CartContext/CartContext';
import { UserProvider } from '@/contexts/UserContext/UserContext';
import config from '@/core/config';
import seo from '@/data/seo';
import siteMetadata from '@/data/siteMetadata';
import { CartService } from '@/modules/cart';
import { storefrontSdk } from '@/modules/shopify';
import { WishlistService } from '@/modules/wishlist';
import CookieBanner from '@/ui/components/CookieBanner';
import Footer from '@/ui/components/Footer';
import GtmScript from '@/ui/components/GtmScript';
import Header from '@/ui/components/Header';
import { ThemeProvider } from '@/ui/components/theme-provider';
import { Toaster } from '@/ui/components/ui/sonner';
import { getUser } from '@/utils/users';

import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
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

const handleInitialCart = async () => {
  const cartId = await CartService.getCartId();
  return cartId ? CartService.getCart(cartId) : null;
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const [headerMenu, footerMenu, initialCart, user, userWishlist] = await Promise.all([
    storefrontSdk().getMenuByHandle({ handle: config.constants.menuHandles.main }),
    storefrontSdk().getMenuByHandle({ handle: config.constants.menuHandles.footer }),
    handleInitialCart(),
    getUser(),
    WishlistService.getWishlist(),
  ]);

  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans scroll-smooth antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
      </head>
      <body className="relative bg-background min-h-screen flex flex-col">
        <GtmScript />
        <CookieBanner />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider initialCart={initialCart}>
            <UserProvider user={user} userWishlist={userWishlist}>
              <Header headerMenu={headerMenu?.menu || null} />
              <main className="flex-1">{children}</main>
              <Toaster richColors />
              <Footer menuItems={footerMenu?.menu?.items} />
            </UserProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
