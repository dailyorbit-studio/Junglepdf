"use client";

import { useMemo, useState } from "react";
import { NumberField, ResultCard, Breakdown, Row } from "@/components/CalcUI";
import { sipFutureValue } from "@/lib/finance";
import { formatINR } from "@/lib/number-format";

export default function SipCalculatorTool() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const r = useMemo(() => {
    const months = (years || 0) * 12;
    const future = sipFutureValue(monthly || 0, rate || 0, months);
    const invested = (monthly || 0) * months;
    return { future, invested, gain: future - invested };
  }, [monthly, rate, years]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 min-w-0">
        <NumberField id="monthly" label="Monthly investment" prefix="₹" value={monthly} onChange={setMonthly} min={0} />
        <NumberField id="rate" label="Expected return" suffix="% p.a." value={rate} onChange={setRate} min={0} />
        <NumberField id="years" label="Duration" suffix="years" value={years} onChange={setYears} min={0} />
      </div>
      <div className="space-y-4 min-w-0">
        <ResultCard label="Estimated value" value={formatINR(r.future)} />
        <Breakdown>
          <Row label="Invested" value={formatINR(r.invested)} />
          <Row label="Estimated gains" value={formatINR(r.gain)} />
        </Breakdown>
      </div>
    </div>
  );
}
