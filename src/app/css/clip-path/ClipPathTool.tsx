"use client";

import { useMemo, useState } from "react";
import { SelectField, GeneratorLayout } from "@/components/GeneratorUI";

const SHAPES: Record<string, string> = {
  triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
  trapezoid: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
  parallelogram: "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
  rhombus: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  pentagon: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
  hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  arrow: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)",
  chevron: "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)",
  circle: "circle(50% at 50% 50%)",
  ellipse: "ellipse(40% 50% at 50% 50%)",
};

export default function ClipPathTool() {
  const [shape, setShape] = useState("hexagon");
  const value = SHAPES[shape];
  const css = useMemo(() => `clip-path: ${value};`, [value]);

  return (
    <GeneratorLayout
      controls={
        <SelectField
          label="Shape"
          value={shape}
          onChange={setShape}
          options={Object.keys(SHAPES).map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) }))}
        />
      }
      preview={
        <div
          style={{
            width: 160,
            height: 160,
            clipPath: value,
            background: "linear-gradient(135deg, #a21caf, #2563eb)",
          }}
        />
      }
      css={css}
    />
  );
}
