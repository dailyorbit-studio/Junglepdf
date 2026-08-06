"use client";

import { useMemo, useState } from "react";
import { NumberField, ResultCard } from "@/components/CalcUI";
import { formatINR } from "@/lib/number-format";

export default function SalaryCalculatorTool() {
  const [annual, setAnnual] = useState(600000);
  const [hours, setHours] = useState(40);

  const r = useMemo(() => {
    const a = annual || 0;
    const h = hours || 0;
    return {
      monthly: a / 12,
      weekly: a / 52,
      daily: a / 260, // ~5 working days a week
      hourly: h > 0 ? a / (52 * h) : 0,
    };
  }, [annual, hours]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="annual" label="Annual salary" prefix="₹" value={annual} onChange={setAnnual} min={0} />
        <NumberField id="hours" label="Hours per week" suffix="hrs" value={hours} onChange={setHours} min={1} />
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <ResultCard label="Monthly" value={formatINR(r.monthly)} />
        <ResultCard label="Weekly" value={formatINR(r.weekly)} />
        <ResultCard label="Daily" value={formatINR(r.daily)} />
        <ResultCard label="Hourly" value={formatINR(r.hourly)} />
      </div>
      <p className="text-xs text-ink-muted">
        These are gross figures before tax and deductions, based on about 260 working days a year.
      </p>
    </div>
  );
}
