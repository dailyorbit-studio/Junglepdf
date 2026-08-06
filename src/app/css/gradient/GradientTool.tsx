"use client";

import { useMemo, useState } from "react";
import { RangeField, ColorField, SelectField, GeneratorLayout } from "@/components/GeneratorUI";

export default function GradientTool() {
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState(135);
  const [c1, setC1] = useState("#7c3aed");
  const [c2, setC2] = useState("#db2777");

  const bg =
    type === "linear"
      ? `linear-gradient(${angle}deg, ${c1}, ${c2})`
      : `radial-gradient(circle, ${c1}, ${c2})`;

  const css = useMemo(() => `background: ${bg};`, [bg]);

  return (
    <GeneratorLayout
      controls={
        <>
          <SelectField
            label="Type"
            value={type}
            onChange={setType}
            options={[
              { value: "linear", label: "Linear" },
              { value: "radial", label: "Radial" },
            ]}
          />
          {type === "linear" && (
            <RangeField label="Angle" value={angle} min={0} max={360} unit="°" onChange={setAngle} />
          )}
          <ColorField label="Colour 1" value={c1} onChange={setC1} />
          <ColorField label="Colour 2" value={c2} onChange={setC2} />
        </>
      }
      preview={<div className="h-full w-full rounded-lg" style={{ minHeight: 190, background: bg }} />}
      css={css}
    />
  );
}
