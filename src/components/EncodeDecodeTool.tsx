"use client";

import { useMemo, useState } from "react";
import CopyButton from "./CopyButton";

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y break-all";

/**
 * Generic two-pane encode / decode UI, shared by the HTML entity, Morse and
 * binary tools. The encode and decode functions are the tool's logic, passed
 * from a thin client wrapper. A thrown error surfaces as an inline message.
 */
export default function EncodeDecodeTool({
  encode,
  decode,
  plainLabel,
  encodedLabel,
  placeholderEncode,
  placeholderDecode,
  errorMessage = "Could not convert this input — check the format.",
}: {
  encode: (s: string) => string;
  decode: (s: string) => string;
  plainLabel: string;
  encodedLabel: string;
  placeholderEncode: string;
  placeholderDecode: string;
  errorMessage?: string;
}) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const result = useMemo<{ output: string } | { error: string }>(() => {
    if (!input) return { output: "" };
    try {
      return { output: mode === "encode" ? encode(input) : decode(input) };
    } catch {
      return { error: errorMessage };
    }
  }, [input, mode, encode, decode, errorMessage]);

  const inLabel = mode === "encode" ? plainLabel : encodedLabel;
  const outLabel = mode === "encode" ? encodedLabel : plainLabel;

  return (
    <div className="space-y-5">
      <div className="flex gap-2 text-sm">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="ed-in" className="block text-sm font-medium text-ink mb-2">
            {inLabel}
          </label>
          <textarea
            id="ed-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder={mode === "encode" ? placeholderEncode : placeholderDecode}
            className={BOX}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">{outLabel}</span>
            {"output" in result && result.output && <CopyButton value={result.output} />}
          </div>
          <textarea readOnly value={"output" in result ? result.output : ""} rows={10} spellCheck={false} className={BOX} />
        </div>
      </div>

      {"error" in result && (
        <p className="rounded-lg border border-error-border bg-error-subtle px-4 py-3 text-sm text-error-ink">
          {result.error}
        </p>
      )}
    </div>
  );
}
