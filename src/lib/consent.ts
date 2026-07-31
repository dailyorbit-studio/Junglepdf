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
    cached = isConsentState(stored) ? stored : "unknown";
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
