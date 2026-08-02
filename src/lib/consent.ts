"use client";

import { useSyncExternalStore } from "react";

/**
 * Cookie-consent state, shared between the banner and anything that loads
 * third-party scripts.
 *
 * The banner used to write a localStorage key that nothing read, so declining
 * had no effect — ad and analytics tags would load either way. AdSlot and
 * ThirdPartyScripts now subscribe here and stay inert until consent is granted.
 */

export type ConsentState = "unknown" | "accepted" | "declined";

const CONSENT_KEY = "junglepdf_cookie_consent";

/**
 * Where a consent prompt is actually required: the EEA, the UK and Switzerland.
 *
 * Everywhere else the banner is asked for and answered by nobody — it is pure
 * friction on the majority of traffic. This is what FreeConvert and effectively
 * every other converter does; theirs is not "no cookie banner", it is Google
 * Funding Choices geo-targeting the prompt to Europe and staying silent
 * elsewhere.
 *
 * Decided from the browser's own timezone rather than an IP lookup, on purpose.
 * A geo-IP service would mean this site phoning a third party on every visit,
 * which is exactly the thing every page here promises it does not do. Timezone
 * costs one synchronous call and no network at all.
 *
 * The trade-off, stated plainly: someone in Berlin whose laptop is set to
 * Asia/Kolkata is treated as out of scope, and a VPN moves the answer. It is a
 * good-faith approximation, not a legal guarantee. When AdSense is approved,
 * Google's certified Privacy & messaging CMP should take this over — it does the
 * same geo-targeting properly, and only a certified CMP satisfies Google's EU
 * user consent policy for serving ads.
 */
const CONSENT_REQUIRED_ZONE =
  /^(Europe\/|Atlantic\/(Azores|Madeira|Canary|Faroe|Reykjavik)|Arctic\/Longyearbyen)/;

function consentRequiredHere(): boolean {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // No timezone to read means no basis to rule Europe out — ask.
    return zone ? CONSENT_REQUIRED_ZONE.test(zone) : true;
  } catch {
    return true;
  }
}

const listeners = new Set<() => void>();

/**
 * Cached so getSnapshot returns a referentially stable value — re-reading
 * localStorage on every render would make useSyncExternalStore loop.
 */
let cached: ConsentState | null = null;

function isConsentState(value: string | null): value is Exclude<ConsentState, "unknown"> {
  return value === "accepted" || value === "declined";
}

export function readConsent(): ConsentState {
  if (cached !== null) return cached;

  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);

    // A stored answer always wins — someone who chose in Europe and then
    // travelled keeps their choice.
    //
    // With nothing stored, outside the EEA/UK/CH we settle on "accepted"
    // without writing it down. Not persisting matters: this is an inference
    // about location, not a decision the visitor made, and recording it as
    // consent would be a lie to anyone reading their own localStorage. Leaving
    // it unwritten also means the answer re-evaluates if they later travel.
    cached = isConsentState(stored)
      ? stored
      : consentRequiredHere()
        ? "unknown"
        : "accepted";
  } catch {
    // Safari private mode throws on localStorage access.
    cached = "unknown";
  }
  return cached;
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function setConsent(state: Exclude<ConsentState, "unknown">): void {
  cached = state;
  try {
    window.localStorage.setItem(CONSENT_KEY, state);
  } catch {
    // Non-persistent is still better than throwing inside a click handler.
  }
  emit();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);

  // Keep tabs in sync when consent changes in another one.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CONSENT_KEY) return;
    cached = null;
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Server and hydration both see "unknown", so the markup matches. */
const getServerSnapshot = (): ConsentState => "unknown";

export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, readConsent, getServerSnapshot);
}
