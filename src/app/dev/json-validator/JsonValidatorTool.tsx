"use client";

import { useMemo, useState } from "react";
import { parseJson } from "@/lib/json-tools";

const INPUT =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

function describe(value: unknown): string {
  if (Array.isArray(value)) return `a JSON array with ${value.length} item${value.length === 1 ? "" : "s"}`;
  if (value === null) return "the JSON value null";
  if (typeof value === "object") {
    const n = Object.keys(value as object).length;
    return `a JSON object with ${n} top-level key${n === 1 ? "" : "s"}`;
  }
  return `a JSON ${typeof value}`;
}

export default function JsonValidatorTool() {
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return parseJson(input);
  }, [input]);

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="json-in" className="block text-sm font-medium text-ink mb-2">
          Paste JSON to validate
        </label>
        <textarea
          id="json-in"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          spellCheck={false}
          placeholder={'{"name":"Ada","roles":["dev","admin"]}'}
          className={INPUT}
        />
      </div>

      {result?.ok && (
        <p className="rounded-lg border border-success-border bg-success-subtle px-4 py-3 text-sm text-success-ink">
          <span className="font-semibold">Valid JSON.</span> This is {describe(result.value)}.
        </p>
      )}

      {result && !result.ok && (
        <p className="rounded-lg border border-error-border bg-error-subtle px-4 py-3 text-sm text-error-ink">
          <span className="font-semibold">Invalid JSON.</span> Problem at line {result.error.line},
          column {result.error.column}. {result.error.message}
        </p>
      )}
    </div>
  );
}
