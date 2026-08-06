"use client";

import { useMemo, useState } from "react";
import { NumberField, ResultCard, Breakdown, Row } from "@/components/CalcUI";
import { emi } from "@/lib/finance";
import { formatINR } from "@/lib/number-format";

export default function EmiCalculatorTool() {
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(9);
  const [years, setYears] = useState(10);

  const r = useMemo(() => {
    const months = (years || 0) * 12;
    const monthly = emi(amount || 0, rate || 0, months);
    const totalPay = monthly * months;
    const interest = totalPay - (amount || 0);
    return { monthly, totalPay, interest, months };
  }, [amount, rate, years]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 min-w-0">
        <NumberField id="amount" label="Loan amount" prefix="₹" value={amount} onChange={setAmount} min={0} />
        <NumberField id="rate" label="Interest rate" suffix="% p.a." value={rate} onChange={setRate} min={0} />
        <NumberField id="years" label="Tenure" suffix="years" value={years} onChange={setYears} min={0} />
      </div>
      <div className="space-y-4 min-w-0">
        <ResultCard label="Monthly EMI" value={formatINR(r.monthly)} sub={`over ${r.months} payments`} />
        <Breakdown>
          <Row label="Principal" value={formatINR(amount || 0)} />
          <Row label="Total interest" value={formatINR(r.interest)} />
          <Row label="Total payable" value={formatINR(r.totalPay)} />
        </Breakdown>
      </div>
    </div>
  );
}
