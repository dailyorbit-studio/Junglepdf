"use client";

import { useMemo, useState } from "react";
import { RangeField, GeneratorLayout } from "@/components/GeneratorUI";

export default function BorderRadiusTool() {
  const [tl, setTl] = useState(24);
  const [tr, setTr] = useState(24);
  const [br, setBr] = useState(24);
  const [bl, setBl] = useState(24);
  const [linked, setLinked] = useState(true);

  const setAll = (v: number) => {
    setTl(v);
    setTr(v);
    setBr(v);
    setBl(v);
  };

  const radius = `${tl}px ${tr}px ${br}px ${bl}px`;
  const css = useMemo(() => `border-radius: ${radius};`, [radius]);

  return (
    <GeneratorLayout
      controls={
        <>
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={linked}
              onChange={(e) => setLinked(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40"
            />
            Link all corners
          </label>
          {linked ? (
            <RangeField label="All corners" value={tl} min={0} max={100} unit="px" onChange={setAll} />
          ) : (
            <>
              <RangeField label="Top-left" value={tl} min={0} max={100} unit="px" onChange={setTl} />
              <RangeField label="Top-right" value={tr} min={0} max={100} unit="px" onChange={setTr} />
              <RangeField label="Bottom-right" value={br} min={0} max={100} unit="px" onChange={setBr} />
              <RangeField label="Bottom-left" value={bl} min={0} max={100} unit="px" onChange={setBl} />
            </>
          )}
        </>
      }
      preview={
        <div
          style={{ width: 150, height: 150, borderRadius: radius, background: "linear-gradient(135deg, #a21caf, #6d28d9)" }}
        />
      }
      css={css}
    />
  );
}
