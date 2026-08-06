"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y break-all";

export default function UrlEncoderTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [whole, setWhole] = useState(false);

  const result = useMemo(() => {
    if (!input) return { output: "" };
    try {
      if (mode === "encode") {
        return { output: whole ? encodeURI(input) : encodeURIComponent(input) };
      }
      return { output: whole ? decodeURI(input) : decodeURIComponent(input) };
    } catch {
      return { error: "Could not decode this — it contains an invalid percent-encoding sequence." };
    }
  }, [input, mode, whole]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex gap-2">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md border px-4 py-1.5 font-medium capitalize transition-colors duration-150 ${
                mode === m
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border bg-surface text-ink-secondary hover:bg-surface-raised"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-ink-secondary">
          <input
            type="checkbox"
            checked={whole}
            onChange={(e) => setWhole(e.target.checked)}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40"
          />
          Whole URL (keep :/?&amp;= )
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="url-in" className="block text-sm font-medium text-ink mb-2">
            {mode === "encode" ? "Plain text" : "Encoded"}
          </label>
          <textarea
            id="url-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            spellCheck={false}
            placeholder={mode === "encode" ? "name=Ada Lovelace & role=admin" : "name%3DAda%20Lovelace"}
            className={BOX}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">{mode === "encode" ? "Encoded" : "Plain text"}</span>
            {"output" in result && result.output && <CopyButton value={result.output} />}
          </div>
          <textarea readOnly value={"output" in result ? result.output : ""} rows={8} spellCheck={false} className={BOX} />
        </div>
      </div>

      {"error" in result && result.error && (
        <p className="rounded-lg border border-error-border bg-error-subtle px-4 py-3 text-sm text-error-ink">
          {result.error}
        </p>
      )}
    </div>
  );
}
