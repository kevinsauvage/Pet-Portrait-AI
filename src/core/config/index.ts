import type { MetadataRoute } from 'next';

import { env } from '@/env';

import { COOKIES, LOCAL_STORAGE_KEYS } from './constants';

const config = {
  cookies: COOKIES,
  localStorageKeys: LOCAL_STORAGE_KEYS,
  name: env.NEXT_PUBLIC_SITE_NAME || 'PetPortrait AI',
  constants: {
    cookieExpiryDays: 182,
    delegateTokenExpirySeconds: 23 * 60 * 60,
    revalidate: {
      catalog: 3600,
      search: 300,
      product: 3600,
      shopify: 600,
    },
    pagination: {
      productsPerPage: 16,
    },
    menuHandles: {
      main: 'main-menu',
      footer: 'footer',
    },
    domains: {
      localhost: 'localhost',
    },
  },
  routes: {
    home: '/',
    create: '/create',
    createStyle: '/create/style',
    createGenerating: '/create/generating',
    createSelect: '/create/select',
    createCollections: '/create/collections',
    createOrder: '/create/order',
    styles: '/styles',
    gallery: '/gallery',
    cart: '/order',
    login: '/login',
    collection: '/shop',
    contact: '/contact',
    faq: '/faq',
    account: '/account',
    addresses: '/account/addresses',
    updateAccount: '/account/update',
    creations: '/account/creations',
    updateAddress: '/account/addresses',
    createAddress: '/account/addresses/create',
    editAddress: '/account/addresses/edit',
    emailResetPassword: '/recover',
    logout: '/account/logout',
    orders: '/account/orders',
    privacy: '/privacy',
    refund: '/refund',
    register: '/register',
    resetPassword: '/reset_password',
    search: '/search',
    shipping: '/shipping',
    subscription: '/subscription-policy',
    terms: '/terms',
  },
};

export const accountNav = [
  { title: 'Dashboard', url: config.routes.account },
  { title: 'My details', url: config.routes.updateAccount },
  { title: 'Address book', url: config.routes.addresses },
  { title: 'My orders', url: config.routes.orders },
  { title: 'My creations', url: config.routes.creations },
  { title: 'Sign out', url: config.routes.logout },
];

const sitemapEntry = (
  url: string,
  opts: { freq?: 'daily' | 'weekly'; priority?: number } = {},
): MetadataRoute.Sitemap[0] => ({
  url,
  changeFrequency: opts.freq ?? 'daily',
  lastModified: new Date().toISOString(),
  priority: opts.priority ?? 0.8,
});

export const sitemap: MetadataRoute.Sitemap = [
  sitemapEntry(config.routes.home, { priority: 1 }),
  sitemapEntry(config.routes.create, { freq: 'weekly', priority: 0.95 }),
  sitemapEntry(config.routes.styles, { freq: 'weekly', priority: 0.9 }),
  sitemapEntry(config.routes.gallery, { freq: 'weekly', priority: 0.85 }),
  ...[
    config.routes.collection,
    config.routes.cart,
    config.routes.contact,
    config.routes.faq,
    config.routes.privacy,
    config.routes.refund,
    config.routes.shipping,
    config.routes.subscription,
    config.routes.terms,
    config.routes.register,
    config.routes.login,
    config.routes.resetPassword,
    config.routes.emailResetPassword,
    config.routes.search,
    config.routes.logout,
    config.routes.updateAccount,
    config.routes.createAddress,
    config.routes.editAddress,
    config.routes.updateAddress,
    config.routes.addresses,
    config.routes.creations,
    config.routes.orders,
  ].map((url) => sitemapEntry(url)),
];

export default config;
