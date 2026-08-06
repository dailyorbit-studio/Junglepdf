"use client";

import { useMemo, useState } from "react";
import { RangeField, ColorField, SelectField, GeneratorLayout } from "@/components/GeneratorUI";

function shade(hex: string, pct: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  const r = clamp(((n >> 16) & 255) + 255 * pct);
  const g = clamp(((n >> 8) & 255) + 255 * pct);
  const b = clamp((n & 255) + 255 * pct);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function NeumorphismTool() {
  const [bg, setBg] = useState("#e0e5ec");
  const [radius, setRadius] = useState(30);
  const [distance, setDistance] = useState(18);
  const [blur, setBlur] = useState(36);
  const [shape, setShape] = useState("flat");

  const dark = shade(bg, -0.15);
  const light = shade(bg, 0.15);

  const css = useMemo(() => {
    const prefix = shape === "pressed" ? "inset " : "";
    const bgLine =
      shape === "concave"
        ? `background: linear-gradient(145deg, ${shade(bg, 0.06)}, ${shade(bg, -0.06)});`
        : shape === "convex"
          ? `background: linear-gradient(145deg, ${shade(bg, -0.06)}, ${shade(bg, 0.06)});`
          : `background: ${bg};`;
    return `border-radius: ${radius}px;
${bgLine}
box-shadow: ${prefix}${distance}px ${distance}px ${blur}px ${dark},
            ${prefix}-${distance}px -${distance}px ${blur}px ${light};`;
  }, [bg, radius, distance, blur, shape, dark, light]);

  const previewShadow =
    (shape === "pressed" ? "inset " : "") +
    `${distance}px ${distance}px ${blur}px ${dark}, ${shape === "pressed" ? "inset " : ""}-${distance}px -${distance}px ${blur}px ${light}`;

  return (
    <GeneratorLayout
      controls={
        <>
          <ColorField label="Background" value={bg} onChange={setBg} />
          <RangeField label="Corner radius" value={radius} min={0} max={80} unit="px" onChange={setRadius} />
          <RangeField label="Distance" value={distance} min={2} max={40} unit="px" onChange={setDistance} />
          <RangeField label="Blur" value={blur} min={2} max={80} unit="px" onChange={setBlur} />
          <SelectField
            label="Shape"
            value={shape}
            onChange={setShape}
            options={[
              { value: "flat", label: "Flat" },
              { value: "concave", label: "Concave" },
              { value: "convex", label: "Convex" },
              { value: "pressed", label: "Pressed (inset)" },
            ]}
          />
        </>
      }
      preview={
        <div className="flex h-full w-full items-center justify-center rounded-lg" style={{ background: bg, minHeight: 190 }}>
          <div style={{ width: 130, height: 130, borderRadius: radius, background: bg, boxShadow: previewShadow }} />
        </div>
      }
      css={css}
    />
  );
}
