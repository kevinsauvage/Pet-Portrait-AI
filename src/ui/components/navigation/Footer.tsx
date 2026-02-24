import Link from 'next/link';

import config from '@/core/config';
import siteMetadata from '@/core/config/siteMetadata';
import type { GetMenuByHandleQuery } from '@/infra/shopify/storefront';

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

const Footer = ({ menuItems }: FooterProps) => {
  return (
    <footer className="border-t border-border/80 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-heading-4 mb-4 font-semibold tracking-tight">{siteMetadata.companyName}</h3>
            <p className="text-body-sm text-muted-foreground max-w-xs leading-relaxed">
              {siteMetadata.about.short.slice(0, 140)}...
            </p>
          </div>

          <div>
            <h4 className="text-label-sm mb-4 text-muted-foreground">Product</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-label-sm mb-4 text-muted-foreground">Support</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-label-sm mb-4 text-muted-foreground">Legal</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {Array.isArray(menuItems) && menuItems.length > 0 && (
              <ul className="space-y-2.5 mt-4">
                {menuItems.flatMap(
                  (item) =>
                    item.items?.map((element) =>
                      typeof element?.url === 'string' ? (
                        <li key={element.id}>
                          <Link
                            href={new URL(element.url).pathname}
                            className="text-body-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            {element.title}
                          </Link>
                        </li>
                      ) : null,
                    ) ?? [],
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border/80">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-caption-sm text-secondary">
            &copy; {new Date().getFullYear()} {siteMetadata.companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {siteMetadata.instagram && (
              <a
                href={siteMetadata.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-foreground transition-colors text-caption-sm"
              >
                Instagram
              </a>
            )}
            {siteMetadata.facebook && (
              <a
                href={siteMetadata.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-foreground transition-colors text-caption-sm"
              >
                Facebook
              </a>
            )}
            {siteMetadata.twitter && (
              <a
                href={siteMetadata.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-foreground transition-colors text-caption-sm"
              >
                Twitter
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
