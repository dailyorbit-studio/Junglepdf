"use client";

import { useState } from "react";
import FileToolRunner, { OptionGroup } from "@/components/FileToolRunner";
import { resizePDF, PAPER_SIZES, type PaperSize, type PageOpResult } from "@/lib/pdf-page-ops";

const SIZES = Object.keys(PAPER_SIZES) as PaperSize[];

export default function ResizePdfTool() {
  const [target, setTarget] = useState<PaperSize>("a4");
  const [keepOrientation, setKeepOrientation] = useState(true);

  return (
    <FileToolRunner<PageOpResult>
      accept=".pdf"
      maxFileSizeMB={100}
      dropLabel="Drop a PDF here, or click to browse"
      dropSublabel="Up to 100MB"
      run={(file, onProgress) => resizePDF(file, { target, keepOrientation }, onProgress)}
      actionLabel="Resize pages"
      busyLabel="Resizing…"
      resultTitle="Pages resized"
      resultDetail={(result) =>
        `${result.pageCount} page${result.pageCount === 1 ? "" : "s"} on ${PAPER_SIZES[target].label.split(" (")[0]}`
      }
      downloadLabel="Download resized PDF"
      againLabel="Resize another"
      hint="A4 and Letter have different proportions, so a page moving between them is scaled to fit and centred rather than stretched. Expect a slightly wider margin on one axis — that is the geometry, not a bug."
      options={(disabled) => (
        <div className="space-y-4">
          <OptionGroup label="Target size">
            <div className="grid sm:grid-cols-2 gap-2">
              {SIZES.map((value) => (
                <label
                  key={value}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                    target === value
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink-secondary hover:bg-surface-raised"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="paper-size"
                    value={value}
                    checked={target === value}
                    disabled={disabled}
                    onChange={() => setTarget(value)}
                    className="accent-accent"
                  />
                  {PAPER_SIZES[value].label}
                </label>
              ))}
            </div>
          </OptionGroup>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={keepOrientation}
              disabled={disabled}
              onChange={(e) => setKeepOrientation(e.target.checked)}
              className="mt-0.5 accent-accent"
            />
            <span className="text-sm text-ink-secondary">
              Keep landscape pages landscape
              <span className="block text-xs text-ink-muted mt-0.5">
                Turn this off to force every page portrait.
              </span>
            </span>
          </label>
        </div>
      )}
    />
  );
}
