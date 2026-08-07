"use client";

import { useMemo, useState } from "react";
import { rgbToHsl, rgbToHex } from "@/lib/color";
import CopyRow from "@/components/CopyRow";

const clamp = (n: number) => Math.max(0, Math.min(255, n || 0));

function Channel({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <input
        type="number"
        min={0}
        max={255}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}

export default function RgbToHslTool() {
  const [r, setR] = useState(21);
  const [g, setG] = useState(128);
  const [b, setB] = useState(61);

  const hsl = useMemo(() => rgbToHsl(r, g, b), [r, g, b]);
  const hex = useMemo(() => rgbToHex(r, g, b), [r, g, b]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Channel label="R" value={r} onChange={setR} />
          <Channel label="G" value={g} onChange={setG} />
          <Channel label="B" value={b} onChange={setB} />
        </div>
        <div className="h-24 rounded-xl border border-border" style={{ background: hex }} />
      </div>
      <div className="space-y-3">
        <CopyRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
        <CopyRow label="HEX" value={hex} />
        <CopyRow label="RGB" value={`rgb(${r}, ${g}, ${b})`} />
      </div>
    </div>
  );
}
