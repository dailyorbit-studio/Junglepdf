"use client";

import { useMemo, useState } from "react";
import CopyButton from "./CopyButton";
import type { Unit } from "@/lib/units";

const INPUT =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const SELECT =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer";

const fmt = (n: number) =>
  Number.isFinite(n) ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(n) : "—";

/**
 * Generic value + from/to converter shared by the length, area, volume,
 * weight, temperature and time tools. The `convert` function is the category's
 * conversion (linear factor, or the temperature formula), passed from a thin
 * client wrapper per tool.
 */
export default function UnitConverter({
  units,
  initialFrom,
  initialTo,
  convert,
}: {
  units: Unit[];
  initialFrom: string;
  initialTo: string;
  convert: (value: number, from: Unit, to: Unit) => number;
}) {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  const fromU = units.find((u) => u.id === from) ?? units[0];
  const toU = units.find((u) => u.id === to) ?? units[1];

  const result = useMemo(() => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? convert(n, fromU, toU) : NaN;
  }, [value, fromU, toU, convert]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <label htmlFor="uc-value" className="block text-sm font-medium text-ink mb-1.5">
            From
          </label>
          <input
            id="uc-value"
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`${INPUT} mb-2`}
          />
          <select value={from} onChange={(e) => setFrom(e.target.value)} className={SELECT} aria-label="Convert from">
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={swap}
          aria-label="Swap units"
          className="mx-auto my-1 flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-surface-raised transition-colors duration-150 sm:mb-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </button>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">To</label>
          <div className={`${INPUT} mb-2 flex items-center justify-between gap-2 bg-surface-raised`}>
            <span className="font-semibold tabular-nums break-all">{fmt(result)}</span>
            {Number.isFinite(result) && <CopyButton value={fmt(result)} label="" className="!px-2 !py-1 shrink-0" />}
          </div>
          <select value={to} onChange={(e) => setTo(e.target.value)} className={SELECT} aria-label="Convert to">
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-ink-muted">
        1 {fromU.label} = {fmt(convert(1, fromU, toU))} {toU.label}
      </p>
    </div>
  );
}
