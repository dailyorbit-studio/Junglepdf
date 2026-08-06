"use client";

import { useMemo, useState } from "react";
import { ResultCard, Breakdown, Row } from "@/components/CalcUI";
import { parseDateInput, todayInput, diffYMD, daysBetween } from "@/lib/date-utils";
import { formatNumber } from "@/lib/number-format";

const DATE_FIELD =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40";

export default function DateDifferenceTool() {
  const [start, setStart] = useState(() => todayInput());
  const [end, setEnd] = useState("");

  const result = useMemo(() => {
    const a = parseDateInput(start);
    const b = parseDateInput(end);
    if (!a || !b) return null;
    const [from, to] = a <= b ? [a, b] : [b, a];
    const days = daysBetween(from, to);
    return { days, weeks: days / 7, ymd: diffYMD(from, to) };
  }, [start, end]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 min-w-0">
        <div>
          <label htmlFor="start" className="block text-sm font-medium text-ink mb-1.5">
            Start date
          </label>
          <input id="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className={DATE_FIELD} />
        </div>
        <div>
          <label htmlFor="end" className="block text-sm font-medium text-ink mb-1.5">
            End date
          </label>
          <input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={DATE_FIELD} />
        </div>
      </div>
      <div className="space-y-4 min-w-0">
        {result ? (
          <>
            <ResultCard
              label="Difference"
              value={`${formatNumber(result.days, 0)} days`}
              sub={`${result.ymd.years}y ${result.ymd.months}m ${result.ymd.days}d`}
            />
            <Breakdown>
              <Row label="Days" value={formatNumber(result.days, 0)} />
              <Row label="Weeks" value={formatNumber(result.weeks)} />
              <Row label="Years, months, days" value={`${result.ymd.years}, ${result.ymd.months}, ${result.ymd.days}`} />
            </Breakdown>
          </>
        ) : (
          <p className="text-sm text-ink-muted">Pick both dates to see the difference.</p>
        )}
      </div>
    </div>
  );
}
