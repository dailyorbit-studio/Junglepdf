"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { parseJson, type JsonError } from "@/lib/json-tools";

type Indent = "2" | "4" | "tab" | "min";

const INPUT =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

export default function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<Indent>("2");

  const result = useMemo<
    { ok: true; output: string } | { ok: false; error: JsonError } | null
  >(() => {
    if (!input.trim()) return null;
    const parsed = parseJson(input);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const space = indent === "min" ? undefined : indent === "tab" ? "\t" : Number(indent);
    return { ok: true, output: JSON.stringify(parsed.value, null, space) ?? "" };
  }, [input, indent]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="json-in" className="block text-sm font-medium text-ink mb-2">
            JSON in
          </label>
          <textarea
            id="json-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            spellCheck={false}
            placeholder={'{"hello":"world","items":[1,2,3]}'}
            className={INPUT}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-ink">Result</label>
            {result?.ok && <CopyButton value={result.output} />}
          </div>
          <textarea
            readOnly
            value={result?.ok ? result.output : ""}
            rows={14}
            spellCheck={false}
            placeholder="Formatted JSON appears here"
            className={INPUT}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-secondary mr-1">Indent:</span>
        {(["2", "4", "tab", "min"] as Indent[]).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setIndent(opt)}
            className={`rounded-md border px-3 py-1.5 font-medium transition-colors duration-150 ${
              indent === opt
                ? "border-accent bg-accent-subtle text-accent"
                : "border-border bg-surface text-ink-secondary hover:bg-surface-raised"
            }`}
          >
            {opt === "2" ? "2 spaces" : opt === "4" ? "4 spaces" : opt === "tab" ? "Tabs" : "Minify"}
          </button>
        ))}
      </div>

      {result && !result.ok && (
        <p className="rounded-lg border border-error-border bg-error-subtle px-4 py-3 text-sm text-error-ink">
          Invalid JSON at line {result.error.line}, column {result.error.column}. {result.error.message}
        </p>
      )}
    </div>
  );
}
