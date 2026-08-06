"use client";

import { useCallback, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { generateLorem, type LoremUnit } from "@/lib/lorem";

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

const UNITS: LoremUnit[] = ["paragraphs", "sentences", "words"];

export default function RandomTextTool() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [classic, setClassic] = useState(true);
  const [output, setOutput] = useState(() => generateLorem(3, "paragraphs", true));

  const generate = useCallback(() => {
    setOutput(generateLorem(count, unit, classic));
  }, [count, unit, classic]);

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
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-ink mb-1.5">
            Unit
          </label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as LoremUnit)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink capitalize focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={generate}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors duration-150"
        >
          Generate
        </button>
      </div>

      <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-ink-secondary">
        <input
          type="checkbox"
          checked={classic}
          onChange={(e) => setClassic(e.target.checked)}
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40"
        />
        Start with &ldquo;Lorem ipsum&hellip;&rdquo;
      </label>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink">Result</span>
          {output && <CopyButton value={output} />}
        </div>
        <textarea readOnly value={output} rows={12} className={BOX} />
      </div>
    </div>
  );
}
