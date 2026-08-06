"use client";

import type { ReactNode } from "react";

/** Labelled number input with optional prefix/suffix, shared by the calculators. */
export function NumberField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step = "any",
  hint,
}: {
  id: string;
  label: string;
  value: number | string;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: string | number;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      {/*
        The input itself is the full-width bordered box, so it always fills the
        field edge to edge. The prefix/suffix are absolutely-positioned overlays
        with pointer-events-none, so they never shrink the input and clicking
        anywhere in the field — including over them — focuses it. The input's
        left/right padding is widened to leave room for whichever is present.
      */}
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-ink-muted">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))}
          // [appearance:textfield] + the spin-button resets remove the native
          // number stepper arrows, which otherwise crowd the suffix and look
          // inconsistent across browsers.
          className={`w-full rounded-lg border border-border bg-surface py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${prefix ? "pl-8" : "pl-3"} ${suffix ? "pr-16" : "pr-3"}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center whitespace-nowrap text-sm text-ink-muted">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

/** Labelled select, sharing the input styling. Options are passed as children. */
export function SelectField({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}

/** The headline result — one big number with a caption. */
export function ResultCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5 text-center">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-1 text-3xl font-bold text-ink tabular-nums break-all">{value}</div>
      {sub && <div className="mt-1 text-sm text-ink-secondary">{sub}</div>}
    </div>
  );
}

/** A labelled row in a breakdown list. */
export function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border-subtle py-2.5 first:border-t-0">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className="font-medium text-ink tabular-nums text-right break-all">{value}</span>
    </div>
  );
}

export function Breakdown({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-border px-4">{children}</div>;
}
