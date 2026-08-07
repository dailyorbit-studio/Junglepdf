"use client";

import CopyButton from "./CopyButton";

/** A labelled value with a copy button — used across the colour tools. */
export default function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised px-4 py-2.5">
      <span className="shrink-0 text-sm text-ink-muted">{label}</span>
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate font-mono text-sm text-ink">{value}</span>
        <CopyButton value={value} label="" className="!px-2 !py-1 shrink-0" />
      </span>
    </div>
  );
}
