"use client";

import { useMemo, useState } from "react";
import { RangeField, ColorField, GeneratorLayout, hexToRgb } from "@/components/GeneratorUI";

export default function BoxShadowTool() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(10);
  const [blur, setBlur] = useState(25);
  const [spread, setSpread] = useState(-5);
  const [opacity, setOpacity] = useState(25);
  const [color, setColor] = useState("#000000");
  const [inset, setInset] = useState(false);

  const shadow = `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px rgba(${hexToRgb(color)}, ${(opacity / 100).toFixed(2)})`;
  const css = useMemo(() => `box-shadow: ${shadow};`, [shadow]);

  return (
    <GeneratorLayout
      controls={
        <>
          <RangeField label="Offset X" value={x} min={-50} max={50} unit="px" onChange={setX} />
          <RangeField label="Offset Y" value={y} min={-50} max={50} unit="px" onChange={setY} />
          <RangeField label="Blur" value={blur} min={0} max={100} unit="px" onChange={setBlur} />
          <RangeField label="Spread" value={spread} min={-50} max={50} unit="px" onChange={setSpread} />
          <RangeField label="Opacity" value={opacity} min={0} max={100} unit="%" onChange={setOpacity} />
          <ColorField label="Colour" value={color} onChange={setColor} />
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={inset}
              onChange={(e) => setInset(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40"
            />
            Inset
          </label>
        </>
      }
      preview={<div style={{ width: 150, height: 150, borderRadius: 16, background: "#ffffff", boxShadow: shadow }} />}
      css={css}
    />
  );
}
