"use client";

import { useMemo, useState } from "react";
import { hexToRgb, rgbToHsl, shift } from "@/lib/color";
import CopyRow from "@/components/CopyRow";
import Swatch from "@/components/Swatch";

const STEPS = [-40, -30, -20, -10, 0, 10, 20, 30, 40];

export default function ColorPickerTool() {
  const [color, setColor] = useState("#15803d");
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const shades = useMemo(() => STEPS.map((d) => shift(color, d)), [color]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label htmlFor="picker" className="block text-sm font-medium text-ink">
            Pick a colour
          </label>
          <input
            id="picker"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-24 w-full cursor-pointer rounded-xl border border-border bg-surface"
          />
        </div>
        <div className="space-y-3">
          <CopyRow label="HEX" value={color} />
          {rgb && <CopyRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />}
          {hsl && <CopyRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-ink mb-2">Tints & shades</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9">
          {shades.map((c, i) => (
            <Swatch key={i} color={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
