"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

type Mode = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab";

const MODES: { id: Mode; label: string }[] = [
  { id: "upper", label: "UPPERCASE" },
  { id: "lower", label: "lowercase" },
  { id: "title", label: "Title Case" },
  { id: "sentence", label: "Sentence case" },
  { id: "camel", label: "camelCase" },
  { id: "pascal", label: "PascalCase" },
  { id: "snake", label: "snake_case" },
  { id: "kebab", label: "kebab-case" },
];

const wordsOf = (text: string): string[] => text.match(/[A-Za-z0-9]+/g) ?? [];

function convert(text: string, mode: Mode): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text.replace(/\b\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
    case "sentence":
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
    case "camel":
      return wordsOf(text)
        .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
        .join("");
    case "pascal":
      return wordsOf(text)
        .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    case "snake":
      return wordsOf(text).map((w) => w.toLowerCase()).join("_");
    case "kebab":
      return wordsOf(text).map((w) => w.toLowerCase()).join("-");
  }
}

export default function CaseConverterTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("upper");

  const output = useMemo(() => (input ? convert(input, mode) : ""), [input, mode]);

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="case-in" className="block text-sm font-medium text-ink mb-2">
          Your text
        </label>
        <textarea
          id="case-in"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder="The Quick Brown Fox"
          className={BOX}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-md border px-3 py-1.5 font-medium transition-colors duration-150 ${
              mode === m.id
                ? "border-accent bg-accent-subtle text-accent"
                : "border-border bg-surface text-ink-secondary hover:bg-surface-raised"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink">Result</span>
          {output && <CopyButton value={output} />}
        </div>
        <textarea readOnly value={output} rows={6} className={BOX} />
      </div>
    </div>
  );
}
