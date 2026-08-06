"use client";

import { useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";

const FIELD =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border-subtle py-2.5 first:border-t-0">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-sm text-ink break-all text-right">{value}</span>
        <CopyButton value={value} label="" className="!px-2" />
      </span>
    </div>
  );
}

export default function TimestampConverterTool() {
  const [stamp, setStamp] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [dateInput, setDateInput] = useState("");

  // A ticking clock for the "current time" panel.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fromStamp = useMemo(() => {
    const raw = stamp.trim();
    if (!raw || !/^-?\d+$/.test(raw)) return null;
    const n = Number(raw);
    // Ten digits or fewer reads as seconds; more reads as milliseconds.
    const ms = Math.abs(n) < 1e12 ? n * 1000 : n;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return {
      utc: d.toUTCString(),
      local: d.toLocaleString(undefined, { timeZoneName: "short" }),
      iso: d.toISOString(),
    };
  }, [stamp]);

  const fromDate = useMemo(() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    return { seconds: String(Math.floor(d.getTime() / 1000)), millis: String(d.getTime()) };
  }, [dateInput]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface-raised p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-ink-secondary">Current Unix time</span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-sm text-ink">{Math.floor(now / 1000)}</span>
            <CopyButton value={String(Math.floor(now / 1000))} label="" className="!px-2" />
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="stamp" className="block text-sm font-medium text-ink mb-2">
          Timestamp → date
        </label>
        <input
          id="stamp"
          value={stamp}
          onChange={(e) => setStamp(e.target.value)}
          inputMode="numeric"
          spellCheck={false}
          placeholder="1516239022 (seconds or milliseconds)"
          className={FIELD}
        />
        {stamp.trim() && !fromStamp && (
          <p className="mt-2 text-sm text-error-ink">Enter a whole number of seconds or milliseconds.</p>
        )}
        {fromStamp && (
          <div className="mt-3 rounded-lg border border-border px-4">
            <Row label="Local" value={fromStamp.local} />
            <Row label="UTC" value={fromStamp.utc} />
            <Row label="ISO 8601" value={fromStamp.iso} />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-ink mb-2">
          Date → timestamp
        </label>
        <input
          id="date"
          type="datetime-local"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className={FIELD}
        />
        {fromDate && (
          <div className="mt-3 rounded-lg border border-border px-4">
            <Row label="Unix seconds" value={fromDate.seconds} />
            <Row label="Milliseconds" value={fromDate.millis} />
          </div>
        )}
      </div>
    </div>
  );
}
