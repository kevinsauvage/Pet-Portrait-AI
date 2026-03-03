import Link from 'next/link';

import config from '@/core/config';
import siteMetadata from '@/core/config/siteMetadata';
import type { GetMenuByHandleQuery } from '@/infra/shopify/storefront';

import { Facebook, Instagram, Twitter } from 'lucide-react';

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
    { label: 'Shipping', href: config.routes.shipping },
    { label: 'Refund Policy', href: config.routes.refund },
    { label: 'FAQ', href: config.routes.contact },
  ],
  legal: [
    { label: 'Privacy Policy', href: config.routes.privacy },
    { label: 'Terms of Service', href: config.routes.terms },
  ],
} as const;

const footerLinkClass =
  'text-body-sm text-muted-foreground hover:text-foreground transition-colors duration-200';

const Footer = ({ menuItems }: FooterProps) => {
  return (
    <footer id="footer" className="border-t border-border/60 bg-card/40">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div>
              <p className="text-heading-4 font-bold tracking-tight">{siteMetadata.companyName}</p>
              <div className="mt-1 h-0.5 w-8 rounded-full bg-primary" />
            </div>
            <p className="text-body-sm text-muted-foreground max-w-xs leading-relaxed">
              {siteMetadata.about.short.slice(0, 120)}...
            </p>
            <div className="flex items-center gap-2 pt-1">
              {siteMetadata.instagram && (
                <a
                  href={siteMetadata.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
                >
                  <Instagram size={16} strokeWidth={1.75} />
                </a>
              )}
              {siteMetadata.facebook && (
                <a
                  href={siteMetadata.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
                >
                  <Facebook size={16} strokeWidth={1.75} />
                </a>
              )}
              {siteMetadata.twitter && (
                <a
                  href={siteMetadata.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
                >
                  <Twitter size={16} strokeWidth={1.75} />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-label-sm text-muted-foreground">Product</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-label-sm text-muted-foreground">Support</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-label-sm text-muted-foreground">Legal</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {Array.isArray(menuItems) &&
                menuItems.length > 0 &&
                menuItems.flatMap(
                  (item) =>
                    item.items?.map((element) =>
                      typeof element?.url === 'string' ? (
                        <li key={element.id}>
                          <Link href={new URL(element.url).pathname} className={footerLinkClass}>
                            {element.title}
                          </Link>
                        </li>
                      ) : null,
                    ) ?? [],
                )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="container mx-auto px-4 py-5">
          <p className="text-center text-caption-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteMetadata.companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
