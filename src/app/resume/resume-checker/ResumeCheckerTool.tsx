"use client";

import { useMemo, useState } from "react";

const ACTION_VERBS = [
  "led", "built", "designed", "developed", "managed", "created", "improved", "increased",
  "reduced", "launched", "delivered", "implemented", "drove", "owned", "shipped", "optimized",
  "optimised", "achieved", "spearheaded", "automated", "streamlined", "cut", "grew", "scaled",
];
const CLICHES = [
  "team player", "hard working", "hard-working", "detail-oriented", "detail oriented",
  "go-getter", "go getter", "synergy", "think outside the box", "results-driven",
  "results driven", "self-starter", "self starter", "proactive", "go-to person",
];

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

export default function ResumeCheckerTool() {
  const [text, setText] = useState("");

  const report = useMemo(() => {
    const t = text.trim();
    if (!t) return null;
    const lower = t.toLowerCase();
    const words = (t.match(/\S+/g) ?? []).length;
    const hasEmail = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/.test(t);
    const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(t);
    const hasNumbers = /\d+\s?%|[₹$€]\s?\d|\b\d{2,}\b/.test(t);
    const actionCount = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`).test(lower)).length;
    const cliches = CLICHES.filter((c) => lower.includes(c));
    const sections = ["experience", "education", "skill"].filter((s) => lower.includes(s));

    const checks = [
      { label: "Length is reasonable (200–900 words)", ok: words >= 200 && words <= 900, tip: `Currently ${words} words.` },
      { label: "Includes an email address", ok: hasEmail, tip: "Add a professional email address." },
      { label: "Includes a phone number", ok: hasPhone, tip: "Add a contact number." },
      { label: "Quantifies impact with numbers", ok: hasNumbers, tip: "Add figures — percentages, amounts, counts." },
      { label: "Uses strong action verbs", ok: actionCount >= 3, tip: "Start bullets with verbs like led, built, improved." },
      { label: "Has clear sections", ok: sections.length >= 2, tip: "Include Experience, Education and Skills headings." },
      { label: "Avoids common clichés", ok: cliches.length === 0, tip: cliches.length ? `Found: ${cliches.join(", ")}` : "" },
    ];
    const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
    return { checks, score };
  }, [text]);

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="resume" className="block text-sm font-medium text-ink mb-2">
          Paste your resume text
        </label>
        <textarea id="resume" value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder="Paste the full text of your resume…" className={BOX} />
      </div>

      {report && (
        <>
          <div className="rounded-xl border border-border bg-surface-raised p-5 text-center">
            <div className="text-xs uppercase tracking-wide text-ink-muted">Resume score</div>
            <div
              className={`mt-1 text-3xl font-bold tabular-nums ${
                report.score >= 70 ? "text-success-ink" : report.score >= 40 ? "text-warning-ink" : "text-error-ink"
              }`}
            >
              {report.score}%
            </div>
          </div>
          <div className="space-y-2">
            {report.checks.map((c) => (
              <div key={c.label} className="flex items-start gap-3 rounded-lg border border-border px-4 py-2.5">
                <span className={`mt-0.5 shrink-0 ${c.ok ? "text-success" : "text-error"}`}>
                  {c.ok ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-ink">{c.label}</p>
                  {!c.ok && c.tip && <p className="text-xs text-ink-muted mt-0.5">{c.tip}</p>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-muted">
            These are rule-based heuristics, not a guarantee — a human reviewer and the specific job still matter most.
          </p>
        </>
      )}
    </div>
  );
}
