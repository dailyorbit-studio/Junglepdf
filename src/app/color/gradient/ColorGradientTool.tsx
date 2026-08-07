"use client";

import { useMemo, useState } from "react";
import { RangeField, ColorField, SelectField, GeneratorLayout } from "@/components/GeneratorUI";

export default function ColorGradientTool() {
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState(90);
  const [c1, setC1] = useState("#15803d");
  const [c2, setC2] = useState("#0891b2");
  const [c3, setC3] = useState("#7c3aed");

  const bg = useMemo(() => {
    const stops = `${c1} 0%, ${c2} 50%, ${c3} 100%`;
    return type === "linear" ? `linear-gradient(${angle}deg, ${stops})` : `radial-gradient(circle, ${stops})`;
  }, [type, angle, c1, c2, c3]);

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
          {type === "linear" && <RangeField label="Angle" value={angle} min={0} max={360} unit="°" onChange={setAngle} />}
          <ColorField label="Stop 1" value={c1} onChange={setC1} />
          <ColorField label="Stop 2" value={c2} onChange={setC2} />
          <ColorField label="Stop 3" value={c3} onChange={setC3} />
        </>
      }
      preview={<div className="h-full w-full rounded-lg" style={{ minHeight: 190, background: bg }} />}
      css={`background: ${bg};`}
    />
  );
}
