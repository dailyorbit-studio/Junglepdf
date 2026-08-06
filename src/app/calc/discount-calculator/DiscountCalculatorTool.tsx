"use client";

import { useMemo, useState } from "react";
import { NumberField, ResultCard, Breakdown, Row } from "@/components/CalcUI";
import { formatINR } from "@/lib/number-format";

export default function DiscountCalculatorTool() {
  const [price, setPrice] = useState(2000);
  const [pct, setPct] = useState(25);

  const r = useMemo(() => {
    const p = price || 0;
    const saved = (p * (pct || 0)) / 100;
    return { saved, final: p - saved };
  }, [price, pct]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 min-w-0">
        <NumberField id="price" label="Original price" prefix="₹" value={price} onChange={setPrice} min={0} />
        <NumberField id="pct" label="Discount" suffix="%" value={pct} onChange={setPct} min={0} max={100} />
      </div>
      <div className="space-y-4 min-w-0">
        <ResultCard label="You pay" value={formatINR(r.final, true)} sub={`Save ${formatINR(r.saved, true)}`} />
        <Breakdown>
          <Row label="Original price" value={formatINR(price || 0, true)} />
          <Row label="Discount" value={`${pct || 0}%`} />
          <Row label="You save" value={formatINR(r.saved, true)} />
        </Breakdown>
      </div>
    </div>
  );
}
