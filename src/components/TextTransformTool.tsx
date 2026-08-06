"use client";

import { useMemo, useState } from "react";
import CopyButton from "./CopyButton";

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

export interface ToggleOpt {
  id: string;
  label: string;
}

/**
 * Input → output text transform with a row of toggle options.
 *
 * The `transform` function is the tool's logic, passed from a thin client
 * wrapper (a server page cannot hand a function to a client component). It
 * receives the raw input and the set of active option ids, so a single
 * component drives the dedupe, blank-line, sort, reverse and slug tools.
 */
export default function TextTransformTool({
  placeholder,
  options = [],
  defaultActive = [],
  transform,
}: {
  placeholder: string;
  options?: ToggleOpt[];
  defaultActive?: string[];
  transform: (input: string, active: Set<string>) => string;
}) {
  const [input, setInput] = useState("");
  const [active, setActive] = useState<Set<string>>(() => new Set(defaultActive));

  const output = useMemo(
    () => (input ? transform(input, active) : ""),
    [input, active, transform]
  );

  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const lineCount = output ? output.split("\n").length : 0;

  return (
    <div className="space-y-5">
      {options.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              aria-pressed={active.has(opt.id)}
              className={`rounded-md border px-3 py-1.5 font-medium transition-colors duration-150 ${
                active.has(opt.id)
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border bg-surface text-ink-secondary hover:bg-surface-raised"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="txt-in" className="block text-sm font-medium text-ink mb-2">
            Input
          </label>
          <textarea
            id="txt-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
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
          <textarea readOnly value={output} rows={14} spellCheck={false} className={BOX} />
          {output && (
            <p className="mt-2 text-xs text-ink-muted">
              {lineCount} line{lineCount === 1 ? "" : "s"} · {output.length} characters
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
