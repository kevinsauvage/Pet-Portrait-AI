'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

import { getCookieFront } from '@/lib/client/cookies';
import type { originalSettingsType } from '@/lib/consents';
import { transformedSettings } from '@/lib/consents';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const GtmScript = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const consentCookie = getCookieFront('localConsent');
    if (consentCookie) {
      try {
        const consent = JSON.parse(consentCookie) as originalSettingsType;
        // Update consent synchronously before any scripts execute
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('consent', 'update', transformedSettings(consent));
        }
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
            });
            // Update consent immediately if cookie exists (for returning visitors)
            (function() {
              try {
                const cookies = document.cookie.split(';');
                let consentCookie = null;
                for (let i = 0; i < cookies.length; i++) {
                  const cookie = cookies[i].trim();
                  if (cookie.startsWith('localConsent=')) {
                    consentCookie = cookie.substring('localConsent='.length);
                    break;
                  }
                }
                if (consentCookie) {
                  const decoded = decodeURIComponent(consentCookie);
                  const consent = JSON.parse(decoded);
                  gtag('consent', 'update', {
                    ad_storage: consent.ad_storage ? 'granted' : 'denied',
                    analytics_storage: consent.analytics_storage ? 'granted' : 'denied',
                    functionality_storage: consent.functionality_storage ? 'granted' : 'denied',
                    personalization_storage: consent.personalization_storage ? 'granted' : 'denied',
                  });
                }
              } catch (e) {
                // Silently fail if cookie parsing fails
              }
            })();`,
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
