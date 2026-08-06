"use client";

import { useMemo, useState } from "react";
import CopyButton from "./CopyButton";

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

/**
 * Two-pane beautify / minify UI shared by the SQL, HTML and CSS formatters.
 *
 * The `format` and `minify` functions are the tool's `lib/` engine, passed in
 * from a thin client wrapper per tool — a server page cannot hand a function
 * across the client boundary, so each tool imports its own engine.
 */
export default function CodeFormatterTool({
  format,
  minify,
  placeholder,
  formatLabel = "Beautify",
}: {
  format: (s: string) => string;
  minify: (s: string) => string;
  placeholder: string;
  formatLabel?: string;
}) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");

  const output = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return mode === "format" ? format(input) : minify(input);
    } catch {
      return "";
    }
  }, [input, mode, format, minify]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="fmt-in" className="block text-sm font-medium text-ink mb-2">
            Input
          </label>
          <textarea
            id="fmt-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            spellCheck={false}
            placeholder={placeholder}
            className={BOX}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">Result</span>
            {output && <CopyButton value={output} />}
          </div>
          <textarea
            readOnly
            value={output}
            rows={16}
            spellCheck={false}
            placeholder="Result appears here"
            className={BOX}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("format")}
          className={`rounded-md border px-3 py-1.5 font-medium transition-colors duration-150 ${
            mode === "format"
              ? "border-accent bg-accent-subtle text-accent"
              : "border-border bg-surface text-ink-secondary hover:bg-surface-raised"
          }`}
        >
          {formatLabel}
        </button>
        <button
          type="button"
          onClick={() => setMode("minify")}
          className={`rounded-md border px-3 py-1.5 font-medium transition-colors duration-150 ${
            mode === "minify"
              ? "border-accent bg-accent-subtle text-accent"
              : "border-border bg-surface text-ink-secondary hover:bg-surface-raised"
          }`}
        >
          Minify
        </button>
      </div>
    </div>
  );
}
