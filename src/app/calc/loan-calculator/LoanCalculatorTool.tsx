"use client";

import { useMemo, useState } from "react";
import { NumberField, ResultCard, Breakdown, Row } from "@/components/CalcUI";
import { emi } from "@/lib/finance";
import { formatINR } from "@/lib/number-format";

export default function LoanCalculatorTool() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(11);
  const [years, setYears] = useState(5);

  const r = useMemo(() => {
    const months = (years || 0) * 12;
    const monthly = emi(amount || 0, rate || 0, months);
    const total = monthly * months;
    return { monthly, total, interest: total - (amount || 0), months };
  }, [amount, rate, years]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 min-w-0">
        <NumberField id="amount" label="Loan amount" prefix="₹" value={amount} onChange={setAmount} min={0} />
        <NumberField id="rate" label="Interest rate" suffix="% p.a." value={rate} onChange={setRate} min={0} />
        <NumberField id="years" label="Repayment term" suffix="years" value={years} onChange={setYears} min={0} />
      </div>
      <div className="space-y-4 min-w-0">
        <ResultCard label="Monthly payment" value={formatINR(r.monthly)} sub={`over ${r.months} months`} />
        <Breakdown>
          <Row label="Principal" value={formatINR(amount || 0)} />
          <Row label="Total interest" value={formatINR(r.interest)} />
          <Row label="Total repaid" value={formatINR(r.total)} />
        </Breakdown>
      </div>
    </div>
  );
}
