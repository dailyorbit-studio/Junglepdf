"use client";

import { useMemo, useState, type ReactNode } from "react";

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

const FLAGS: { flag: string; label: string }[] = [
  { flag: "g", label: "global" },
  { flag: "i", label: "ignore case" },
  { flag: "m", label: "multiline" },
  { flag: "s", label: "dotall" },
  { flag: "u", label: "unicode" },
  { flag: "y", label: "sticky" },
];

interface Hit {
  match: string;
  index: number;
  groups: string[];
}

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<string[]>(["g"]);
  const [text, setText] = useState("");

  const { error, hits } = useMemo(() => {
    if (!pattern) return { error: null, hits: [] as Hit[] };
    let re: RegExp;
    try {
      const flagStr = flags.join("");
      re = new RegExp(pattern, flagStr.includes("g") ? flagStr : flagStr + "g");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Invalid regular expression.", hits: [] as Hit[] };
    }

    const found: Hit[] = [];
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = re.exec(text)) !== null) {
      found.push({ match: m[0], index: m.index, groups: m.slice(1).map((g) => g ?? "") });
      // Zero-length matches would loop forever without nudging lastIndex.
      if (m.index === re.lastIndex) re.lastIndex++;
      if (++guard > 10000) break;
    }
    return { error: null, hits: found };
  }, [pattern, flags, text]);

  const highlighted: ReactNode = useMemo(() => {
    if (error || hits.length === 0 || !text) return text;
    const nodes: ReactNode[] = [];
    let last = 0;
    hits.forEach((h, i) => {
      if (h.index > last) nodes.push(text.slice(last, h.index));
      nodes.push(
        <mark key={i} className="rounded bg-accent-subtle text-accent px-0.5">
          {text.slice(h.index, h.index + h.match.length) || "∅"}
        </mark>
      );
      last = h.index + h.match.length;
    });
    if (last < text.length) nodes.push(text.slice(last));
    return nodes;
  }, [hits, text, error]);

  const toggleFlag = (flag: string) =>
    setFlags((prev) => (prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]));

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="pattern" className="block text-sm font-medium text-ink mb-2">
          Pattern
        </label>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-ink-muted">/</span>
          <input
            id="pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
            placeholder="\b\w+@\w+\.\w+\b"
            className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <span className="text-ink-muted">/{flags.join("")}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {FLAGS.map(({ flag, label }) => (
          <button
            key={flag}
            type="button"
            onClick={() => toggleFlag(flag)}
            title={label}
            className={`rounded-md border px-2.5 py-1 font-mono transition-colors duration-150 ${
              flags.includes(flag)
                ? "border-accent bg-accent-subtle text-accent"
                : "border-border bg-surface text-ink-secondary hover:bg-surface-raised"
            }`}
          >
            {flag}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-error-border bg-error-subtle px-4 py-3 text-sm text-error-ink">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="test" className="block text-sm font-medium text-ink mb-2">
          Test text
        </label>
        <textarea
          id="test"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          spellCheck={false}
          placeholder="Paste the text to search…"
          className={BOX}
        />
      </div>

      {!error && pattern && (
        <>
          <div className="rounded-lg border border-border bg-surface-raised p-4">
            <p className="text-sm font-semibold text-ink mb-2">
              {hits.length} match{hits.length === 1 ? "" : "es"}
            </p>
            <p className="whitespace-pre-wrap break-words font-mono text-sm text-ink-secondary leading-relaxed">
              {highlighted}
            </p>
          </div>

          {hits.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-raised text-ink-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Match</th>
                    <th className="px-3 py-2 font-medium">Index</th>
                    <th className="px-3 py-2 font-medium">Groups</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-ink">
                  {hits.slice(0, 200).map((h, i) => (
                    <tr key={i} className="border-t border-border-subtle">
                      <td className="px-3 py-2 text-ink-muted">{i + 1}</td>
                      <td className="px-3 py-2 break-all">{h.match || "∅"}</td>
                      <td className="px-3 py-2 text-ink-muted">{h.index}</td>
                      <td className="px-3 py-2 break-all text-ink-secondary">
                        {h.groups.length ? h.groups.join(", ") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
