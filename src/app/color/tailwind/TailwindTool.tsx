"use client";

import { useMemo, useState } from "react";
import { hexToHsl, hslToHex } from "@/lib/color";
import { ColorField } from "@/components/GeneratorUI";
import { Field, CodeResult } from "@/components/SeoForm";
import Swatch from "@/components/Swatch";

// Target lightness per Tailwind step; hue and saturation come from the base.
const LMAP: [string, number][] = [
  ["50", 97], ["100", 94], ["200", 86], ["300", 77], ["400", 66],
  ["500", 55], ["600", 47], ["700", 39], ["800", 32], ["900", 26], ["950", 16],
];

export default function TailwindTool() {
  const [color, setColor] = useState("#15803d");
  const [name, setName] = useState("brand");

  const scale = useMemo(() => {
    const hsl = hexToHsl(color);
    if (!hsl) return [];
    return LMAP.map(([step, l]) => ({ step, hex: hslToHex(hsl.h, hsl.s, l) }));
  }, [color]);

  const config = useMemo(() => {
    if (!scale.length) return "";
    const key = name.trim() || "brand";
    return `'${key}': {\n${scale.map((s) => `  '${s.step}': '${s.hex}',`).join("\n")}\n}`;
  }, [scale, name]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField label="Base colour" value={color} onChange={setColor} />
        <Field label="Colour name" value={name} onChange={setName} placeholder="brand" />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
        {scale.map((s) => (
          <Swatch key={s.step} color={s.hex} label={s.step} />
        ))}
      </div>
      <CodeResult code={config} label="tailwind.config.js" />
    </div>
  );
}
