"use client";

import { useState } from "react";

/** A clickable colour swatch that copies its value to the clipboard. */
export default function Swatch({ color, label }: { color: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard denied — value is on screen */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${color}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border text-left transition-shadow hover:shadow-[var(--shadow-card)]"
    >
      <span className="h-14 w-full" style={{ background: color }} />
      <span className="flex items-center justify-between gap-1 px-2 py-1.5 text-xs">
        {label && <span className="text-ink-muted">{label}</span>}
        <span className="font-mono text-ink">{copied ? "Copied" : color}</span>
      </span>
    </button>
  );
}
