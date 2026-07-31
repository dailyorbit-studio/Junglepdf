"use client";

import Script from "next/script";
import { useConsent } from "@/lib/consent";

/**
 * Loads AdSense and GA4 only after the visitor accepts cookies.
 *
 * These used to sit commented out in layout.tsx <head>, which would have made
 * them unconditional the moment someone uncommented them — the Decline button
 * wrote a localStorage key that nothing consulted. Gating them here keeps the
 * banner honest.
 *
 * To go live, set these in .env.local (or your host's env settings):
 *   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * Leaving either unset simply skips that script.
 */

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function ThirdPartyScripts() {
  const consent = useConsent();

  if (consent !== "accepted") return null;

  return (
    <>
      {ADSENSE_CLIENT && (
        <Script
          id="adsense"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      )}

      {GA_MEASUREMENT_ID && (
        <>
          <Script
            id="ga-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
