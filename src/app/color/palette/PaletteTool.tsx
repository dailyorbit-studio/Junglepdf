"use client";

import { useMemo, useState } from "react";
import { hexToHsl, hslToHex } from "@/lib/color";
import { ColorField } from "@/components/GeneratorUI";
import Swatch from "@/components/Swatch";

export default function PaletteTool() {
  const [color, setColor] = useState("#15803d");

  const schemes = useMemo(() => {
    const hsl = hexToHsl(color);
    if (!hsl) return [];
    const rot = (deg: number) => hslToHex((hsl.h + deg + 360) % 360, hsl.s, hsl.l);
    return [
      { name: "Complementary", colors: [color, rot(180)] },
      { name: "Analogous", colors: [rot(-30), color, rot(30)] },
      { name: "Triadic", colors: [color, rot(120), rot(240)] },
      { name: "Tetradic", colors: [color, rot(90), rot(180), rot(270)] },
    ];
  }, [color]);

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <ColorField label="Base colour" value={color} onChange={setColor} />
      </div>
      <div className="space-y-5">
        {schemes.map((scheme) => (
          <div key={scheme.name}>
            <h2 className="text-sm font-medium text-ink mb-2">{scheme.name}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {scheme.colors.map((c, i) => (
                <Swatch key={i} color={c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
