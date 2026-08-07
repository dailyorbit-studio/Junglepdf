"use client";

import { useState } from "react";
import { ColorField } from "@/components/GeneratorUI";
import CopyRow from "@/components/CopyRow";
import { hexToRgb, rgbToHsl } from "@/lib/color";

export default function CssColorTool() {
  const [color, setColor] = useState("#15803d");
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <ColorField label="Colour" value={color} onChange={setColor} />
        <div className="h-24 rounded-xl border border-border" style={{ background: color }} />
      </div>
      <div className="space-y-3">
        <CopyRow label="color" value={`color: ${color};`} />
        <CopyRow label="background" value={`background-color: ${color};`} />
        <CopyRow label="border" value={`border: 1px solid ${color};`} />
        <CopyRow label="variable" value={`--brand: ${color};`} />
        {rgb && <CopyRow label="rgb" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />}
        {hsl && <CopyRow label="hsl" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />}
      </div>
    </div>
  );
}
