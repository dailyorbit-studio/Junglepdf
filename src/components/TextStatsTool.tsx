"use client";

import { useMemo, useState } from "react";

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

interface Stat {
  label: string;
  value: string;
}

/** Live counts for the Word Counter and Character Counter tools. */
export default function TextStatsTool({ variant }: { variant: "words" | "characters" }) {
  const [text, setText] = useState("");

  const s = useMemo(() => {
    const chars = [...text].length;
    const charsNoSpaces = [...text.replace(/\s/g, "")].length;
    const words = (text.trim().match(/\S+/g) ?? []).length;
    const sentences = (text.match(/[^.!?…]+[.!?…]+/g) ?? []).length;
    const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const readMins = words / 200; // ~200 words per minute
    return { chars, charsNoSpaces, words, sentences, paragraphs, lines, readMins };
  }, [text]);

  const readLabel =
    s.readMins === 0
      ? "0 sec"
      : s.readMins < 1
        ? `${Math.ceil(s.readMins * 60)} sec`
        : `${Math.ceil(s.readMins)} min`;

  const stats: Stat[] =
    variant === "words"
      ? [
          { label: "Words", value: s.words.toLocaleString() },
          { label: "Characters", value: s.chars.toLocaleString() },
          { label: "Sentences", value: s.sentences.toLocaleString() },
          { label: "Paragraphs", value: s.paragraphs.toLocaleString() },
          { label: "Lines", value: s.lines.toLocaleString() },
          { label: "Reading time", value: readLabel },
        ]
      : [
          { label: "Characters", value: s.chars.toLocaleString() },
          { label: "Without spaces", value: s.charsNoSpaces.toLocaleString() },
          { label: "Words", value: s.words.toLocaleString() },
          { label: "Lines", value: s.lines.toLocaleString() },
        ];

  const limits =
    variant === "characters"
      ? [
          { label: "SMS", max: 160 },
          { label: "Tweet", max: 280 },
          { label: "Title tag", max: 60 },
          { label: "Meta description", max: 160 },
        ]
      : [];

  return (
    <div className="space-y-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Start typing or paste your text…"
        className={BOX}
      />

      <div
        className={`grid gap-3 ${
          variant === "words" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
        }`}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-surface-raised p-4 text-center">
            <div className="text-2xl font-bold text-ink tabular-nums">{stat.value}</div>
            <div className="mt-1 text-xs text-ink-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {limits.length > 0 && (
        <div className="space-y-2.5">
          {limits.map((limit) => {
            const pct = Math.min(100, (s.chars / limit.max) * 100);
            const over = s.chars > limit.max;
            return (
              <div key={limit.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-ink-secondary">{limit.label}</span>
                  <span className={over ? "text-error-ink font-medium" : "text-ink-muted"}>
                    {s.chars} / {limit.max}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">
                  <div
                    className={`h-full rounded-full ${over ? "bg-error" : "bg-accent"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
