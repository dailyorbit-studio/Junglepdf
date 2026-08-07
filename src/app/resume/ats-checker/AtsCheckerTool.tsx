"use client";

import { useMemo, useState } from "react";

const STOP = new Set(
  "a an the and or but if then of to in for on with at by from as is are was were be been being this that these those you your yours we our ours they their them it its will would should could can may might must have has had do does did not no our we're i am about into over under more most such via per etc will your you a an we can role team work working experience years year strong ability able using use used help provide within across including include includes required require preferred plus new".split(
    /\s+/
  )
);

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

export default function AtsCheckerTool() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");

  const analysis = useMemo(() => {
    if (!resume.trim() || !jd.trim()) return null;
    const words = (jd.toLowerCase().match(/[a-z][a-z+#.\-]{2,}/g) ?? []).filter((w) => !STOP.has(w));
    const freq = new Map<string, number>();
    words.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
    const keywords = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24).map((e) => e[0]);
    const rl = resume.toLowerCase();
    const matched = keywords.filter((k) => rl.includes(k));
    const missing = keywords.filter((k) => !matched.includes(k));
    const pct = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;
    return { matched, missing, pct };
  }, [resume, jd]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-ink mb-2">
            Your resume
          </label>
          <textarea id="resume" value={resume} onChange={(e) => setResume(e.target.value)} rows={10} placeholder="Paste your resume text…" className={BOX} />
        </div>
        <div>
          <label htmlFor="jd" className="block text-sm font-medium text-ink mb-2">
            Job description
          </label>
          <textarea id="jd" value={jd} onChange={(e) => setJd(e.target.value)} rows={10} placeholder="Paste the job description…" className={BOX} />
        </div>
      </div>

      {analysis && (
        <>
          <div className="rounded-xl border border-border bg-surface-raised p-5 text-center">
            <div className="text-xs uppercase tracking-wide text-ink-muted">Keyword match</div>
            <div className={`mt-1 text-3xl font-bold tabular-nums ${analysis.pct >= 70 ? "text-success-ink" : analysis.pct >= 40 ? "text-warning-ink" : "text-error-ink"}`}>
              {analysis.pct}%
            </div>
            <div className="mt-1 text-sm text-ink-secondary">
              {analysis.matched.length} of {analysis.matched.length + analysis.missing.length} key terms found
            </div>
          </div>

          {analysis.missing.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-ink mb-2">Missing keywords</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.missing.map((k) => (
                  <span key={k} className="rounded-full border border-error-border bg-error-subtle px-3 py-1 text-xs text-error-ink">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-medium text-ink mb-2">Matched keywords</h2>
            <div className="flex flex-wrap gap-2">
              {analysis.matched.map((k) => (
                <span key={k} className="rounded-full border border-success-border bg-success-subtle px-3 py-1 text-xs text-success-ink">
                  {k}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            Only add missing keywords that genuinely describe your experience — never pad a resume with terms that are not true.
          </p>
        </>
      )}
    </div>
  );
}
