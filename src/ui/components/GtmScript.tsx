'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

import { getCookieFront } from '@/lib/client/cookies';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const GtmScript = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const consentCookie = getCookieFront('localConsent');
    if (consentCookie) {
      try {
        const consent = JSON.parse(consentCookie);
        setTimeout(() => {
          setHasConsent(consent.analytics_storage || consent.ad_storage);
        }, 0);
      } catch {
        setTimeout(() => {
          setHasConsent(false);
        }, 0);
      }
    } else {
      setTimeout(() => {
        setHasConsent(false);
      }, 0);
    }
  }, []);

  return (
    <>
      <Script
        id="gtag-stub"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'granted',
              personalization_storage: 'denied',
            });`,
        }}
      />

      {hasConsent && GTM_ID && (
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${GTM_ID}');`,
          }}
        />
      )}
    </>
  );
};

export default GtmScript;
