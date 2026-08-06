"use client";

import { useMemo, useState } from "react";
import { RangeField, SelectField, GeneratorLayout } from "@/components/GeneratorUI";
import type { CSSProperties } from "react";

export default function FlexboxTool() {
  const [direction, setDirection] = useState("row");
  const [justify, setJustify] = useState("flex-start");
  const [align, setAlign] = useState("stretch");
  const [wrap, setWrap] = useState("nowrap");
  const [gap, setGap] = useState(8);

  const css = useMemo(
    () => `display: flex;
flex-direction: ${direction};
justify-content: ${justify};
align-items: ${align};
flex-wrap: ${wrap};
gap: ${gap}px;`,
    [direction, justify, align, wrap, gap]
  );

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: direction as CSSProperties["flexDirection"],
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap as CSSProperties["flexWrap"],
    gap,
    minHeight: 180,
    width: "100%",
  };

  return (
    <GeneratorLayout
      controls={
        <>
          <SelectField
            label="Direction"
            value={direction}
            onChange={setDirection}
            options={[
              { value: "row", label: "row" },
              { value: "row-reverse", label: "row-reverse" },
              { value: "column", label: "column" },
              { value: "column-reverse", label: "column-reverse" },
            ]}
          />
          <SelectField
            label="Justify content"
            value={justify}
            onChange={setJustify}
            options={["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"].map((v) => ({ value: v, label: v }))}
          />
          <SelectField
            label="Align items"
            value={align}
            onChange={setAlign}
            options={["stretch", "flex-start", "center", "flex-end", "baseline"].map((v) => ({ value: v, label: v }))}
          />
          <SelectField
            label="Wrap"
            value={wrap}
            onChange={setWrap}
            options={["nowrap", "wrap", "wrap-reverse"].map((v) => ({ value: v, label: v }))}
          />
          <RangeField label="Gap" value={gap} min={0} max={40} unit="px" onChange={setGap} />
        </>
      }
      preview={
        <div style={containerStyle}>
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex items-center justify-center rounded-md px-4 py-3 text-sm font-medium text-css"
              style={{ background: "var(--color-css-subtle)" }}
            >
              {n}
            </div>
          ))}
        </div>
      }
      css={css}
    />
  );
}
