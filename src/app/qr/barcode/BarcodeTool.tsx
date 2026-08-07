"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Field, Select } from "@/components/SeoForm";

const FORMATS = [
  { value: "CODE128", label: "CODE128 (any text)" },
  { value: "EAN13", label: "EAN-13 (12–13 digits)" },
  { value: "EAN8", label: "EAN-8 (7–8 digits)" },
  { value: "UPC", label: "UPC-A (11–12 digits)" },
  { value: "CODE39", label: "CODE39" },
  { value: "ITF14", label: "ITF-14 (14 digits)" },
  { value: "codabar", label: "Codabar" },
];

export default function BarcodeTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [value, setValue] = useState("JUNGLEPDF");
  const [format, setFormat] = useState("CODE128");
  const [error, setError] = useState("");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const render = () => {
      if (!value) {
        setError("");
        setDataUrl("");
        return;
      }
      try {
        JsBarcode(canvas, value, { format, displayValue: true, margin: 12, background: "#ffffff", fontSize: 16 });
        setError("");
        setDataUrl(canvas.toDataURL("image/png"));
      } catch {
        setError(`"${value}" is not valid for the ${format} format.`);
        setDataUrl("");
      }
    };
    render();
  }, [value, format]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Value" value={value} onChange={setValue} placeholder="Text or number to encode" />
        <Select label="Barcode format" value={format} onChange={setFormat} options={FORMATS} />
        {error && (
          <p className="rounded-lg border border-error-border bg-error-subtle px-4 py-3 text-sm text-error-ink">{error}</p>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface-raised p-6">
        <canvas ref={canvasRef} className="max-w-full" style={{ display: dataUrl ? "block" : "none" }} />
        {!dataUrl && !error && <p className="py-16 text-sm text-ink-muted">Enter a value to generate a barcode.</p>}
        {dataUrl && (
          <a
            href={dataUrl}
            download="barcode.png"
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors duration-150"
          >
            Download PNG
          </a>
        )}
      </div>
    </div>
  );
}
