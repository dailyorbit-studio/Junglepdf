"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y break-all";

function encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function decode(b64: string): string {
  const bin = atob(b64.replace(/\s+/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const result = useMemo(() => {
    if (!input) return { output: "" };
    try {
      return { output: mode === "encode" ? encode(input) : decode(input) };
    } catch {
      return { error: "That is not valid Base64 — check for stray characters or missing padding." };
    }
  }, [input, mode]);

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
          <label htmlFor="b64-in" className="block text-sm font-medium text-ink mb-2">
            {mode === "encode" ? "Text" : "Base64"}
          </label>
          <textarea
            id="b64-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder={mode === "encode" ? "Hello, world! 👋" : "SGVsbG8sIHdvcmxkISDwn5GL"}
            className={BOX}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">{mode === "encode" ? "Base64" : "Text"}</span>
            {"output" in result && result.output && <CopyButton value={result.output} />}
          </div>
          <textarea
            readOnly
            value={"output" in result ? result.output : ""}
            rows={10}
            spellCheck={false}
            className={BOX}
          />
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
