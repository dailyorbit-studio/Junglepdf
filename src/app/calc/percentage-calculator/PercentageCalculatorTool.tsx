"use client";

import { useMemo, useState } from "react";
import { NumberField, ResultCard } from "@/components/CalcUI";
import { formatNumber } from "@/lib/number-format";

type Tab = "of" | "isWhat" | "change";

const TABS: { id: Tab; label: string }[] = [
  { id: "of", label: "% of a number" },
  { id: "isWhat", label: "X is what % of Y" },
  { id: "change", label: "% change" },
];

export default function PercentageCalculatorTool() {
  const [tab, setTab] = useState<Tab>("of");
  const [a, setA] = useState(20);
  const [b, setB] = useState(150);

  const result = useMemo(() => {
    const x = a || 0;
    const y = b || 0;
    if (tab === "of") return { value: (x / 100) * y, label: `${x}% of ${y}`, unit: "" };
    if (tab === "isWhat")
      return { value: y === 0 ? NaN : (x / y) * 100, label: `${x} is this % of ${y}`, unit: "%" };
    return {
      value: x === 0 ? NaN : ((y - x) / x) * 100,
      label: `Change from ${x} to ${y}`,
      unit: "%",
    };
  }, [tab, a, b]);

  const [labelA, labelB] =
    tab === "of" ? ["Percentage (%)", "Number"] : tab === "isWhat" ? ["Value (X)", "Total (Y)"] : ["From", "To"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 text-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md border px-3 py-1.5 font-medium transition-colors duration-150 ${
              tab === t.id
                ? "border-accent bg-accent-subtle text-accent"
                : "border-border bg-surface text-ink-secondary hover:bg-surface-raised"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 min-w-0">
          <NumberField id="a" label={labelA} value={a} onChange={setA} />
          <NumberField id="b" label={labelB} value={b} onChange={setB} />
        </div>
        <ResultCard
          label={result.label}
          value={Number.isFinite(result.value) ? `${formatNumber(result.value)}${result.unit}` : "—"}
        />
      </div>
    </div>
  );
}
