"use client";

import { useMemo, useState } from "react";
import { RangeField, ColorField, GeneratorLayout, hexToRgb } from "@/components/GeneratorUI";

export default function GlassmorphismTool() {
  const [blur, setBlur] = useState(10);
  const [alpha, setAlpha] = useState(20);
  const [sat, setSat] = useState(120);
  const [radius, setRadius] = useState(16);
  const [color, setColor] = useState("#ffffff");

  const css = useMemo(() => {
    const rgb = hexToRgb(color);
    return `background: rgba(${rgb}, ${(alpha / 100).toFixed(2)});
border-radius: ${radius}px;
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
backdrop-filter: blur(${blur}px) saturate(${sat}%);
-webkit-backdrop-filter: blur(${blur}px) saturate(${sat}%);
border: 1px solid rgba(255, 255, 255, 0.3);`;
  }, [blur, alpha, sat, radius, color]);

  return (
    <GeneratorLayout
      controls={
        <>
          <RangeField label="Blur" value={blur} min={0} max={30} unit="px" onChange={setBlur} />
          <RangeField label="Transparency" value={alpha} min={0} max={100} unit="%" onChange={setAlpha} />
          <RangeField label="Saturation" value={sat} min={0} max={200} unit="%" onChange={setSat} />
          <RangeField label="Corner radius" value={radius} min={0} max={40} unit="px" onChange={setRadius} />
          <ColorField label="Tint" value={color} onChange={setColor} />
        </>
      }
      preview={
        <div
          className="flex h-full w-full items-center justify-center rounded-lg"
          style={{ background: "linear-gradient(135deg, #f97316, #db2777, #7c3aed)", minHeight: 190 }}
        >
          <div
            style={{
              width: 170,
              height: 115,
              background: `rgba(${hexToRgb(color)}, ${alpha / 100})`,
              borderRadius: radius,
              boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
              backdropFilter: `blur(${blur}px) saturate(${sat}%)`,
              WebkitBackdropFilter: `blur(${blur}px) saturate(${sat}%)`,
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </div>
      }
      css={css}
    />
  );
}
