"use client";

import { useMemo, useState } from "react";
import { hexToRgb, rgbToHsl, rgbToHex } from "@/lib/color";
import CopyRow from "@/components/CopyRow";

const INPUT =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent";

export default function HexToRgbTool() {
  const [hex, setHex] = useState("#15803d");
  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const normHex = rgb ? rgbToHex(rgb.r, rgb.g, rgb.b) : "#000000";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <label htmlFor="hex" className="block text-sm font-medium text-ink">
          HEX colour
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={normHex}
            onChange={(e) => setHex(e.target.value)}
            className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-surface"
            aria-label="Pick colour"
          />
          <input id="hex" type="text" value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#15803d" className={INPUT} />
        </div>
        <div className="h-24 rounded-xl border border-border" style={{ background: rgb ? normHex : "transparent" }} />
        {!rgb && <p className="text-sm text-error-ink">Enter a valid 3- or 6-digit HEX colour, e.g. #15803d.</p>}
      </div>
      <div className="space-y-3">
        {rgb && hsl && (
          <>
            <CopyRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
            <CopyRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
            <CopyRow label="HEX" value={normHex} />
          </>
        )}
      </div>
    </div>
  );
}
