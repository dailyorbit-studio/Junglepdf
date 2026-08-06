"use client";

import { useMemo, useState } from "react";
import { ResultCard, Breakdown, Row } from "@/components/CalcUI";

const TIME_FIELD =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40";

function toMinutes(value: string): number | null {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export default function TimeDurationTool() {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:30");

  const result = useMemo(() => {
    const a = toMinutes(start);
    const b = toMinutes(end);
    if (a === null || b === null) return null;
    // A span that ends "before" it starts is read as crossing midnight.
    const total = (b - a + 1440) % 1440;
    return { hours: Math.floor(total / 60), mins: total % 60, total };
  }, [start, end]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 min-w-0">
        <div>
          <label htmlFor="start" className="block text-sm font-medium text-ink mb-1.5">
            Start time
          </label>
          <input id="start" type="time" value={start} onChange={(e) => setStart(e.target.value)} className={TIME_FIELD} />
        </div>
        <div>
          <label htmlFor="end" className="block text-sm font-medium text-ink mb-1.5">
            End time
          </label>
          <input id="end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={TIME_FIELD} />
        </div>
      </div>
      <div className="space-y-4 min-w-0">
        {result ? (
          <>
            <ResultCard label="Duration" value={`${result.hours}h ${result.mins}m`} />
            <Breakdown>
              <Row label="Total hours" value={(result.total / 60).toFixed(2)} />
              <Row label="Total minutes" value={result.total} />
            </Breakdown>
          </>
        ) : (
          <p className="text-sm text-ink-muted">Enter a start and end time.</p>
        )}
      </div>
    </div>
  );
}
