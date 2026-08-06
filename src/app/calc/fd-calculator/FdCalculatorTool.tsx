"use client";

import { useMemo, useState } from "react";
import { NumberField, SelectField, ResultCard, Breakdown, Row } from "@/components/CalcUI";
import { fdMaturity } from "@/lib/finance";
import { formatINR } from "@/lib/number-format";

const FREQS: { label: string; value: number }[] = [
  { label: "Yearly", value: 1 },
  { label: "Half-yearly", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
];

export default function FdCalculatorTool() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(5);
  const [freq, setFreq] = useState(4);

  const r = useMemo(() => {
    const maturity = fdMaturity(principal || 0, rate || 0, years || 0, freq);
    return { maturity, interest: maturity - (principal || 0) };
  }, [principal, rate, years, freq]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 min-w-0">
        <NumberField id="principal" label="Deposit amount" prefix="₹" value={principal} onChange={setPrincipal} min={0} />
        <NumberField id="rate" label="Interest rate" suffix="% p.a." value={rate} onChange={setRate} min={0} />
        <NumberField id="years" label="Tenure" suffix="years" value={years} onChange={setYears} min={0} />
        <SelectField id="freq" label="Compounding" value={freq} onChange={(v) => setFreq(Number(v))}>
          {FREQS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="space-y-4 min-w-0">
        <ResultCard label="Maturity amount" value={formatINR(r.maturity)} />
        <Breakdown>
          <Row label="Principal" value={formatINR(principal || 0)} />
          <Row label="Interest earned" value={formatINR(r.interest)} />
        </Breakdown>
      </div>
    </div>
  );
}
