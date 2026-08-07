"use client";

import { useMemo, useState } from "react";
import { hexToRgb, contrastRatio } from "@/lib/color";
import { ColorField } from "@/components/GeneratorUI";

export default function ContrastTool() {
  const [fg, setFg] = useState("#ffffff");
  const [bg, setBg] = useState("#15803d");

  const ratio = useMemo(() => {
    const f = hexToRgb(fg);
    const b = hexToRgb(bg);
    return f && b ? contrastRatio(f, b) : NaN;
  }, [fg, bg]);

  const r = Number.isFinite(ratio) ? ratio : 0;
  const checks = [
    { label: "Normal text · AA", pass: r >= 4.5 },
    { label: "Normal text · AAA", pass: r >= 7 },
    { label: "Large text · AA", pass: r >= 3 },
    { label: "Large text · AAA", pass: r >= 4.5 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <ColorField label="Text colour" value={fg} onChange={setFg} />
        <ColorField label="Background colour" value={bg} onChange={setBg} />
        <div className="rounded-xl border border-border p-5" style={{ background: bg, color: fg }}>
          <p className="text-base">The quick brown fox jumps over the lazy dog.</p>
          <p className="text-xl font-semibold mt-2">Large heading text</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface-raised p-5 text-center">
          <div className="text-xs uppercase tracking-wide text-ink-muted">Contrast ratio</div>
          <div className="mt-1 text-3xl font-bold text-ink tabular-nums">{r.toFixed(2)}:1</div>
        </div>
        <div className="space-y-2">
          {checks.map((c) => (
            <div
              key={c.label}
              className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
                c.pass ? "border-success-border bg-success-subtle text-success-ink" : "border-error-border bg-error-subtle text-error-ink"
              }`}
            >
              <span>{c.label}</span>
              <span className="font-semibold">{c.pass ? "Pass" : "Fail"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
