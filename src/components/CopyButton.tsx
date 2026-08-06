"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Copy-to-clipboard button with inline "Copied" feedback.
 *
 * Every developer, text and generator tool ends in the same place — a block of
 * output the user wants on their clipboard — so the copy affordance lives here
 * once rather than being re-implemented per tool.
 *
 * navigator.clipboard needs a secure context (https or localhost). The fallback
 * to a hidden textarea + execCommand keeps it working on the odd http preview,
 * and a caught failure just leaves the label unchanged rather than throwing.
 */
export default function CopyButton({
  value,
  label = "Copy",
  className = "",
  disabled = false,
}: {
  value: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the pending reset if the button unmounts mid-flash.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // A denied clipboard permission is not worth an error banner — the text
      // is still on screen to select by hand.
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled || !value}
      className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink-secondary hover:text-ink hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${className}`}
    >
      {copied ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
