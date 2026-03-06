'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import config from '@/core/config';
import siteMetadata from '@/core/config/siteMetadata';
import type { GetMenuByHandleQuery } from '@/infra/shopify/generated/storefront/index';
import { cn } from '@/lib/utils';

import { Facebook, Instagram, Sparkles, Twitter } from 'lucide-react';

type MenuItem = NonNullable<GetMenuByHandleQuery['menu']>['items'][number];

type FooterProps = {
  menuItems: MenuItem[] | undefined;
};

const FOOTER_LINKS = {
  product: [
    { label: 'Create Portrait', href: config.routes.create },
    { label: 'Portrait Styles', href: config.routes.styles },
    { label: 'Gallery', href: config.routes.gallery },
    { label: 'Shop All', href: config.routes.collection },
  ],
  support: [
    { label: 'Contact Us', href: config.routes.contact },
    { label: 'FAQ', href: config.routes.faq },
    { label: 'Shipping', href: config.routes.shipping },
    { label: 'Refund Policy', href: config.routes.refund },
  ],
  legal: [
    { label: 'Privacy Policy', href: config.routes.privacy },
    { label: 'Terms of Service', href: config.routes.terms },
    { label: 'Shipping Policy', href: config.routes.shipping },
    { label: 'Purchase Options & Cancellation', href: config.routes.subscription },
  ],
} as const;

type FooterLinkColumnProps = {
  heading: string;
  links: ReadonlyArray<{ label: string; href: string }>;
  extraItems?: React.ReactNode;
};

const FooterLinkColumn = ({ heading, links, extraItems }: FooterLinkColumnProps) => {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-caption-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
          {heading}
        </p>
        <div className="h-px w-5 rounded-full bg-primary/50" />
      </div>
      <ul className="space-y-3">
        {links.map((link) => {
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <li key={link.href + link.label}>
              <Link
                href={link.href}
                className={cn(
                  'group flex items-center gap-2 text-body-sm transition-colors duration-150',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'inline-block h-0.5 rounded-full bg-primary transition-all duration-200',
                    isActive ? 'w-2.5' : 'w-0 group-hover:w-2.5',
                  )}
                />
                {link.label}
              </Link>
            </li>
          );
        })}
        {extraItems}
      </ul>
    </div>
  );
};

const SocialLink = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-md"
  >
    {children}
  </a>
);

const Footer = ({ menuItems }: FooterProps) => {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  const shopifyMenuItems = Array.isArray(menuItems)
    ? menuItems.flatMap(
        (item) =>
          item.items?.map((element) => {
            if (typeof element?.url !== 'string') return null;
            const href = new URL(element.url).pathname;
            const isActive = pathname.startsWith(href);
            return (
              <li key={element.id}>
                <Link
                  href={href}
                  className={cn(
                    'group flex items-center gap-2 text-body-sm transition-colors duration-150',
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-0.5 rounded-full bg-primary transition-all duration-200',
                      isActive ? 'w-2.5' : 'w-0 group-hover:w-2.5',
                    )}
                  />
                  {element.title}
                </Link>
              </li>
            );
          }) ?? [],
      )
    : [];

  return (
    <footer id="footer" className="relative overflow-hidden border-t border-border/50">
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_110%,color-mix(in_srgb,var(--primary)_5%,transparent),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-card/60" />

      {/* Main footer content */}
      <div className="relative container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-14">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* Brand column — wider */}
          <div className="sm:col-span-2 md:col-span-4 space-y-6">
            {/* Logo / name */}
            <div>
              <Link href={config.routes.home} className="group inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:shadow-primary/30">
                  <Sparkles size={15} strokeWidth={2} />
                </span>
                <span className="text-heading-4 font-bold tracking-tight text-foreground">
                  {siteMetadata.companyName}
                </span>
              </Link>
            </div>

            {/* Tagline */}
            <p className="max-w-[28ch] text-body-sm leading-relaxed text-muted-foreground">
              {siteMetadata.about.short.slice(0, 110)}…
            </p>

            {/* Contact email */}
            {siteMetadata.email && (
              <a
                href={`mailto:${siteMetadata.email}`}
                className="inline-flex items-center gap-2 text-body-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-primary"
              >
                {siteMetadata.email}
              </a>
            )}

            {/* Social links */}
            <div className="flex items-center gap-3">
              {siteMetadata.instagram && (
                <SocialLink href={siteMetadata.instagram} label="Instagram">
                  <Instagram size={15} strokeWidth={1.75} />
                </SocialLink>
              )}
              {siteMetadata.facebook && (
                <SocialLink href={siteMetadata.facebook} label="Facebook">
                  <Facebook size={15} strokeWidth={1.75} />
                </SocialLink>
              )}
              {siteMetadata.twitter && (
                <SocialLink href={siteMetadata.twitter} label="Twitter / X">
                  <Twitter size={15} strokeWidth={1.75} />
                </SocialLink>
              )}
            </div>
          </div>

          {/* Spacer on large screens */}
          <div className="hidden md:block md:col-span-1" />

          {/* Link columns */}
          <div className="md:col-span-2">
            <FooterLinkColumn heading="Product" links={FOOTER_LINKS.product} />
          </div>
          <div className="md:col-span-2">
            <FooterLinkColumn heading="Support" links={FOOTER_LINKS.support} />
          </div>
          <div className="md:col-span-3">
            <FooterLinkColumn
              heading="Legal"
              links={FOOTER_LINKS.legal}
              extraItems={shopifyMenuItems.length > 0 ? shopifyMenuItems : undefined}
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-border/40">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-caption-sm text-muted-foreground">
              &copy; {year} {siteMetadata.companyName}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[
                { href: config.routes.privacy, label: 'Privacy' },
                { href: config.routes.terms, label: 'Terms' },
                { href: config.routes.refund, label: 'Refunds' },
              ].map((link, index, array) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <div key={link.href} className="flex items-center gap-4">
                    <Link
                      href={link.href}
                      className={cn(
                        'text-caption-sm transition-colors',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {link.label}
                    </Link>
                    {index < array.length - 1 && (
                      <span className="h-3 w-px bg-border/70" aria-hidden />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
