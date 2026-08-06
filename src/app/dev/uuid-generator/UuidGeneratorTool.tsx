"use client";

import { useCallback, useState } from "react";
import CopyButton from "@/components/CopyButton";

/** v4 UUID, falling back to getRandomValues where randomUUID is unavailable. */
function uuidv4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0"));
  return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`;
}

const MAX = 1000;

export default function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [braces, setBraces] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, uuidv4));

  const generate = useCallback(() => {
    const n = Math.min(MAX, Math.max(1, count || 1));
    setUuids(Array.from({ length: n }, uuidv4));
  }, [count]);

  const decorate = (u: string) => {
    let out = hyphens ? u : u.replace(/-/g, "");
    if (uppercase) out = out.toUpperCase();
    if (braces) out = `{${out}}`;
    return out;
  };

  const rendered = uuids.map(decorate);
  const joined = rendered.join("\n");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="count" className="block text-sm font-medium text-ink mb-1.5">
            How many
          </label>
          <input
            id="count"
            type="number"
            min={1}
            max={MAX}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-28 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <button
          type="button"
          onClick={generate}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors duration-150"
        >
          Generate
        </button>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-ink-secondary">
        <Toggle checked={hyphens} onChange={setHyphens} label="Hyphens" />
        <Toggle checked={uppercase} onChange={setUppercase} label="Uppercase" />
        <Toggle checked={braces} onChange={setBraces} label="Braces { }" />
      </div>

      <div className="rounded-lg border border-border bg-surface-raised p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-ink">
            {rendered.length} UUID{rendered.length === 1 ? "" : "s"}
          </span>
          <CopyButton value={joined} label="Copy all" />
        </div>
        <pre className="max-h-80 overflow-auto text-sm font-mono text-ink leading-relaxed">
          {joined}
        </pre>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40"
      />
      {label}
    </label>
  );
}
