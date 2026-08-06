"use client";

import { useMemo, useState } from "react";
import { ResultCard, Breakdown, Row } from "@/components/CalcUI";
import { parseDateInput, todayInput, diffYMD, daysBetween, type YMD } from "@/lib/date-utils";
import { formatNumber } from "@/lib/number-format";

const DATE_FIELD =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40";

export default function AgeCalculatorTool() {
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState(() => todayInput());

  const result = useMemo<
    { ok: true; age: YMD; totalDays: number } | { ok: false; error: string } | null
  >(() => {
    const from = parseDateInput(dob);
    const to = parseDateInput(asOf);
    if (!from || !to) return null;
    if (from > to) return { ok: false, error: "The date of birth must be on or before the reference date." };
    return { ok: true, age: diffYMD(from, to), totalDays: daysBetween(from, to) };
  }, [dob, asOf]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 min-w-0">
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-ink mb-1.5">
            Date of birth
          </label>
          <input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={DATE_FIELD} />
        </div>
        <div>
          <label htmlFor="asof" className="block text-sm font-medium text-ink mb-1.5">
            Age at date
          </label>
          <input id="asof" type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className={DATE_FIELD} />
        </div>
      </div>
      <div className="space-y-4 min-w-0">
        {result && !result.ok && (
          <p className="rounded-lg border border-error-border bg-error-subtle px-4 py-3 text-sm text-error-ink">
            {result.error}
          </p>
        )}
        {result?.ok && (
          <>
            <ResultCard
              label="Age"
              value={`${result.age.years} yr`}
              sub={`${result.age.months} months, ${result.age.days} days`}
            />
            <Breakdown>
              <Row label="Years" value={result.age.years} />
              <Row label="Months" value={result.age.months} />
              <Row label="Days" value={result.age.days} />
              <Row label="Total days lived" value={formatNumber(result.totalDays, 0)} />
            </Breakdown>
          </>
        )}
        {!result && <p className="text-sm text-ink-muted">Enter a date of birth to see the exact age.</p>}
      </div>
    </div>
  );
}
