"use client";

import { useEffect, useRef } from "react";
import { useConsent } from "@/lib/consent";

/**
 * Ad container.
 *
 * Two modes, chosen by whether a publisher ID exists in the environment:
 *
 *   - NEXT_PUBLIC_ADSENSE_CLIENT unset → a labelled placeholder box, so the
 *     layout can be judged with ads in place before there is an account.
 *   - set → real <ins class="adsbygoogle"> markup, pushed on mount.
 *
 * Going live is therefore an environment change, not a code change. Set these
 * in .env.local (or your host's env settings):
 *
 *   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *   NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD=XXXXXXXXXX
 *   NEXT_PUBLIC_ADSENSE_SLOT_INFEED=XXXXXXXXXX
 *   NEXT_PUBLIC_ADSENSE_SLOT_ANCHOR=XXXXXXXXXX
 *
 * The loader script lives in ThirdPartyScripts and is gated on the same
 * consent state as this component — see lib/consent.
 *
 * Note: AdSense has no sandbox/test-ad mode for the web (that is AdMob, which
 * is mobile-app only). Until the account is approved, placeholders are the
 * honest option — serving anything that imitates a live ad unit would be
 * inventing inventory that does not exist.
 */

interface AdSlotProps {
  variant: "leaderboard" | "in-feed" | "anchor";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

const VARIANT_CONFIG = {
  leaderboard: {
    height: "90px",
    label: "Leaderboard",
    size: "728 × 90",
    wrapperClass: "w-full max-w-[728px] mx-auto",
    slot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  },
  "in-feed": {
    height: "250px",
    label: "In-feed",
    size: "300 × 250",
    wrapperClass: "w-full max-w-2xl mx-auto",
    slot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED,
  },
  anchor: {
    height: "50px",
    label: "Anchor",
    size: "320 × 50",
    wrapperClass: "w-full max-w-[320px] mx-auto",
    slot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ANCHOR,
  },
} as const;

export default function AdSlot({ variant, className = "" }: AdSlotProps) {
  const consent = useConsent();
  const config = VARIANT_CONFIG[variant];

  // No consent, no ad — and no reserved space either, so the layout doesn't
  // hold a gap for something that will never render.
  if (consent !== "accepted") return null;

  const configured = ADSENSE_CLIENT && config.slot;

  // Placeholders are a development affordance, not something to ship.
  //
  // In production with no publisher ID they rendered grey boxes reading
  // "Ad placeholder · no publisher ID" on every page to anyone who accepted the
  // cookie banner. That reads as an unfinished site to a visitor, and it is
  // actively bad for the AdSense application itself — the reviewer is looking
  // at the live site and those boxes say the build is not done. Rendering
  // nothing until the IDs exist is both tidier and honest: there is no ad.
  if (!configured && process.env.NODE_ENV === "production") return null;

  const unit = configured ? (
    <AdSenseUnit client={ADSENSE_CLIENT} slot={config.slot} height={config.height} />
  ) : (
    <PlaceholderUnit
      label={config.label}
      size={config.size}
      height={config.height}
      reason={ADSENSE_CLIENT ? "no slot ID" : "no publisher ID"}
    />
  );

  if (variant === "anchor") {
    return (
      <>
        {/* Spacer so the fixed bar doesn't cover the end of the page. */}
        <div className="h-[66px] sm:hidden" aria-hidden="true" />
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 p-2 bg-surface/90 backdrop-blur-sm border-t border-border sm:hidden ${className}`}
        >
          <div className={config.wrapperClass}>{unit}</div>
        </div>
      </>
    );
  }

  return (
    <div className={`py-4 ${className}`}>
      <div className={config.wrapperClass}>{unit}</div>
    </div>
  );
}

function AdSenseUnit({
  client,
  slot,
  height,
}: {
  client: string;
  slot: string;
  height: string;
}) {
  const pushed = useRef(false);

  useEffect(() => {
    // Guard against a second push at the same <ins>. React StrictMode invokes
    // effects twice in development, and AdSense throws "All ins elements in
    // the body of the page already have ads in them" on the repeat.
    if (pushed.current) return;
    pushed.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // The loader script may not have arrived yet, or an ad blocker ate it.
      // Neither is worth surfacing to the visitor.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle block"
      style={{ display: "block", minHeight: height }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

function PlaceholderUnit({
  label,
  size,
  height,
  reason,
}: {
  label: string;
  size: string;
  height: string;
  reason: string;
}) {
  return (
    <div
      className="ad-placeholder rounded-lg flex-col gap-1"
      style={{ height }}
      // Not aria-hidden: a screen reader user should know the space is an ad
      // slot rather than encountering an unexplained gap in the page.
      role="img"
      aria-label={`Advertisement placeholder, ${size}`}
    >
      <span className="font-medium tracking-normal normal-case">
        Ad placeholder · {label}
      </span>
      <span className="text-[0.6875rem] tracking-normal normal-case opacity-70">
        {size} · {reason}
      </span>
    </div>
  );
}
