"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { readConsent, setConsent } from "@/lib/consent";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent() !== "unknown") return;

    // Small delay so the banner doesn't flash on load
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  function choose(state: "accepted" | "declined") {
    setConsent(state);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 animate-slide-up"
    >
      <div className="max-w-3xl mx-auto bg-surface border border-border rounded-xl shadow-dropdown p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink mb-1">Cookie notice</p>
            <p className="text-sm text-ink-secondary leading-relaxed">
              This site uses cookies from third-party advertising partners to show you relevant ads
              and measure traffic. Your files are never uploaded — all processing stays on your device.
              See our{" "}
              <Link href="/legal/privacy-policy" className="text-accent hover:underline">
                privacy policy
              </Link>{" "}
              for details.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => choose("declined")}
              className="px-4 py-2 text-sm font-medium text-ink-secondary border border-border rounded-lg hover:bg-surface-raised transition-colors duration-150"
            >
              Decline
            </button>
            <button
              onClick={() => choose("accepted")}
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors duration-150"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
