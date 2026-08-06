"use client";

import { useMemo, useState } from "react";
import { RangeField, GeneratorLayout } from "@/components/GeneratorUI";

export default function GridTool() {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(2);
  const [gap, setGap] = useState(12);

  const css = useMemo(
    () => `display: grid;
grid-template-columns: repeat(${cols}, 1fr);
grid-template-rows: repeat(${rows}, 1fr);
gap: ${gap}px;`,
    [cols, rows, gap]
  );

  const cells = Array.from({ length: cols * rows });

  return (
    <GeneratorLayout
      controls={
        <>
          <RangeField label="Columns" value={cols} min={1} max={6} onChange={setCols} />
          <RangeField label="Rows" value={rows} min={1} max={6} onChange={setRows} />
          <RangeField label="Gap" value={gap} min={0} max={40} unit="px" onChange={setGap} />
        </>
      }
      preview={
        <div
          className="w-full"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap,
            minHeight: 180,
          }}
        >
          {cells.map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-md text-sm font-medium text-css"
              style={{ background: "var(--color-css-subtle)", minHeight: 40 }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      }
      css={css}
    />
  );
}
