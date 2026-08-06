"use client";

import type { ReactNode } from "react";
import CopyButton from "./CopyButton";

/** Slider with a live value readout, used across the CSS generators. */
export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-ink-secondary">{label}</span>
        <span className="font-mono text-ink tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-ink-secondary mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-xs text-ink-muted uppercase">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-border bg-surface"
          aria-label={label}
        />
      </span>
    </div>
  );
}

/**
 * Shared three-part layout for a CSS generator: controls, a live preview, and
 * the generated code with a copy button.
 */
export function GeneratorLayout({
  controls,
  preview,
  css,
}: {
  controls: ReactNode;
  preview: ReactNode;
  css: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">{controls}</div>
        <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-raised p-6">
          {preview}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface-raised p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-ink">CSS</span>
          <CopyButton value={css} />
        </div>
        <pre className="overflow-x-auto text-xs font-mono text-ink leading-relaxed whitespace-pre-wrap">
          {css}
        </pre>
      </div>
    </div>
  );
}

/** Convert a #rrggbb hex string to an "r, g, b" triplet for rgba(). */
export function hexToRgb(hex: string): string {
  const m = hex.replace("#", "");
  const int = parseInt(m.length === 3 ? m.replace(/(.)/g, "$1$1") : m, 16);
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`;
}
