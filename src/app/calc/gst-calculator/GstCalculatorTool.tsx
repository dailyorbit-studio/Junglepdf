"use client";

import { useMemo, useState } from "react";
import { NumberField, ResultCard, Breakdown, Row } from "@/components/CalcUI";
import { formatINR } from "@/lib/number-format";

const RATES = [5, 12, 18, 28];

export default function GstCalculatorTool() {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState<"add" | "remove">("add");

  const r = useMemo(() => {
    const a = amount || 0;
    const rt = (rate || 0) / 100;
    if (mode === "add") {
      const tax = a * rt;
      return { base: a, tax, total: a + tax };
    }
    const base = a / (1 + rt);
    return { base, tax: a - base, total: a };
  }, [amount, rate, mode]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 min-w-0">
        <div className="flex gap-2 text-sm">
          {(["add", "remove"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md border px-4 py-1.5 font-medium transition-colors duration-150 ${
                mode === m
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border bg-surface text-ink-secondary hover:bg-surface-raised"
              }`}
            >
              {m === "add" ? "Add GST" : "Remove GST"}
            </button>
          ))}
        </div>
        <NumberField
          id="amount"
          label={mode === "add" ? "Amount (before GST)" : "Amount (incl. GST)"}
          prefix="₹"
          value={amount}
          onChange={setAmount}
          min={0}
        />
        <NumberField id="rate" label="GST rate" suffix="%" value={rate} onChange={setRate} min={0} />
        <div className="flex flex-wrap gap-2">
          {RATES.map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setRate(rt)}
              className={`rounded-md border px-3 py-1 text-sm transition-colors duration-150 ${
                rate === rt ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-secondary hover:bg-surface-raised"
              }`}
            >
              {rt}%
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4 min-w-0">
        <ResultCard
          label={mode === "add" ? "Total (incl. GST)" : "Net (excl. GST)"}
          value={formatINR(mode === "add" ? r.total : r.base, true)}
        />
        <Breakdown>
          <Row label="Base amount" value={formatINR(r.base, true)} />
          <Row label={`CGST (${(rate || 0) / 2}%)`} value={formatINR(r.tax / 2, true)} />
          <Row label={`SGST (${(rate || 0) / 2}%)`} value={formatINR(r.tax / 2, true)} />
          <Row label="Total GST" value={formatINR(r.tax, true)} />
          <Row label="Gross amount" value={formatINR(r.total, true)} />
        </Breakdown>
      </div>
    </div>
  );
}
