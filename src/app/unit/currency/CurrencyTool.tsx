"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";

const CURRENCIES: { code: string; name: string }[] = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "INR", name: "Indian Rupee" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "CHF", name: "Swiss Franc" },
];

// Indicative snapshot: 1 USD = X currency. Not live — the user can override the
// rate below, keeping the tool fully offline (no network, nothing uploaded).
const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.3, JPY: 157, AUD: 1.51,
  CAD: 1.36, CNY: 7.24, AED: 3.67, SGD: 1.35, CHF: 0.88,
};

const cross = (from: string, to: string) => Number((RATES[to] / RATES[from]).toFixed(6));

const INPUT =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const SELECT =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer";

export default function CurrencyTool() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [rate, setRate] = useState(String(cross("USD", "INR")));

  // Changing either currency resets the editable rate to the indicative cross —
  // done in the handler rather than an effect to avoid a render-triggered update.
  const changeFrom = (v: string) => {
    setFrom(v);
    setRate(String(cross(v, to)));
  };
  const changeTo = (v: string) => {
    setTo(v);
    setRate(String(cross(from, v)));
  };

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    return Number.isFinite(a) && Number.isFinite(r) ? a * r : NaN;
  }, [amount, rate]);

  const fmt = (n: number) =>
    Number.isFinite(n) ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n) : "—";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-ink mb-1.5">
            Amount
          </label>
          <input id="amount" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={INPUT} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">From</label>
            <select value={from} onChange={(e) => changeFrom(e.target.value)} className={SELECT} aria-label="From currency">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">To</label>
            <select value={to} onChange={(e) => changeTo(e.target.value)} className={SELECT} aria-label="To currency">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="rate" className="block text-sm font-medium text-ink mb-1.5">
          Rate — 1 {from} = ? {to}
        </label>
        <div className="flex items-center gap-2">
          <input id="rate" type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className={INPUT} />
          <button
            type="button"
            onClick={() => setRate(String(cross(from, to)))}
            className="shrink-0 rounded-lg border border-border px-3 py-2.5 text-sm text-ink-secondary hover:bg-surface-raised transition-colors duration-150"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-raised p-5 text-center">
        <div className="text-xs uppercase tracking-wide text-ink-muted">
          {amount || 0} {from} =
        </div>
        <div className="mt-1 flex items-center justify-center gap-2 text-3xl font-bold text-ink tabular-nums break-all">
          {fmt(result)} {to}
          {Number.isFinite(result) && <CopyButton value={`${fmt(result)}`} label="" className="!px-2 !py-1" />}
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        The built-in rates are an indicative snapshot, not live — edit the rate above with today&apos;s
        figure for an exact conversion. Everything stays on your device; no rate is ever fetched.
      </p>
    </div>
  );
}
